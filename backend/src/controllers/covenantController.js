// LOCATION: backend/src/controllers/covenantController.js

const { Covenant, CovenantAudit, Loan, Customer, Payment, RecoveryTask } = require('../models');

const {
  asyncHandler,
  NotFoundError,
  AuthorizationError
} = require('../utils/errorHandler');

// ✅ CREATE COVENANT (UNCHANGED - KEEPS YOUR EXISTING LOGIC)
exports.createCovenant = asyncHandler(async (req, res) => {
  const { loanId, type, name, threshold, operator, frequency, description, severity } =
    req.body;

  if (req.user.role !== 'admin') {
    throw new AuthorizationError('Only admins can create covenants');
  }

  const loan = await Loan.findByPk(loanId);
  if (!loan) {
    throw new NotFoundError('Loan not found');
  }

  const covenant = await Covenant.create({
    loanId,
    type,
    name,
    threshold,
    operator: operator || 'GREATER_THAN',
    frequency,
    description,
    severity,
    status: 'ACTIVE'
  });

  res.status(201).json({
    success: true,
    message: 'Covenant created successfully',
    data: covenant
  });
});

// ✅ GET COVENANTS WITH REAL-TIME EMI PAYMENT TRACKING USING RECOVERY TASKS
exports.getCovenants = asyncHandler(async (req, res) => {
  const { loanId, status } = req.query;
  const where = {};

  if (loanId) where.loanId = parseInt(loanId);
  if (status) where.status = status;

  const covenants = await Covenant.findAll({
    where,
    include: [
      {
        model: Loan,
        attributes: [
          'id',
          'amount',
          'status',
          'customerId',
          'recoveryStatus',
          'startDate',
          'termMonths'
        ],
        required: true,
        include: [
          {
            model: Customer,
            attributes: ['id', 'name', 'email']
          },
          {
            model: Payment,
            attributes: ['id', 'status', 'paymentDate'],
            required: false,
            where: { status: 'completed' }
          }
        ]
      }
    ],
    order: [
      ['status', 'ASC'], // BREACHED first
      ['severity', 'DESC'],
      ['createdAt', 'DESC']
    ]
  });

  // ✅ AUTO-CHECK PAYMENT_DELAY COVENANTS AND MARK AS BREACHED
  for (const covenant of covenants) {
    if (covenant.type === 'PAYMENT_DELAY' && covenant.status === 'ACTIVE') {
      const loan = covenant.Loan;
      if (loan && loan.startDate && loan.Payments) {
        const startDate = new Date(loan.startDate);
        const now = new Date();
        const daysSinceStart = Math.floor((now - startDate) / (24 * 60 * 60 * 1000));
        const monthsSinceStart = Math.floor(daysSinceStart / 30);
        const expectedPayments = Math.min(monthsSinceStart, loan.termMonths || 0);
        const completedPayments = loan.Payments.length;

        // Calculate days overdue for latest expected payment
        const latestExpectedPaymentMonth = expectedPayments;
        const latestExpectedPaymentDate = new Date(startDate);
        latestExpectedPaymentDate.setMonth(latestExpectedPaymentDate.getMonth() + latestExpectedPaymentMonth);

        const daysOverdue = Math.floor((now - latestExpectedPaymentDate) / (24 * 60 * 60 * 1000));

        // Check if payment is overdue beyond threshold
        if (expectedPayments > completedPayments && daysOverdue > covenant.threshold) {
          // Mark as BREACHED
          if (covenant.status !== 'BREACHED') {
            await covenant.update({
              status: 'BREACHED',
              breachDate: new Date(),
              breachValue: daysOverdue,
              lastChecked: new Date()
            });

            console.log(`⚠️ COVENANT BREACH DETECTED:`);
            console.log(`  • Covenant ID: ${covenant.id} (${covenant.name})`);
            console.log(`  • Loan ID: ${loan.id}`);
            console.log(`  • Days Overdue: ${daysOverdue} days`);
            console.log(`  • Threshold: ${covenant.threshold} days`);
            console.log(`  • Expected Payments: ${expectedPayments}`);
            console.log(`  • Completed Payments: ${completedPayments}`);
          }
        } else {
          // Update last checked time only
          if (covenant.lastChecked === null ||
            (now - new Date(covenant.lastChecked)) > 15 * 60 * 1000) {
            await covenant.update({
              lastChecked: new Date()
            });
          }
        }
      }
    }
  }

  // ✅ ENHANCED: Calculate payment status using RECOVERY TASKS AND PAYMENTS
  const covenantsWithPayments = await Promise.all(
    covenants.map(async (covenant) => {
      const loan = covenant.Loan;

      if (loan && loan.Payments) {
        // Get all COMPLETED recovery tasks for this loan
        const completedTasks = await RecoveryTask.count({
          where: {
            loanId: loan.id,
            taskType: 'EMI_TRACKING',
            status: 'COMPLETED'
          }
        });

        // ✅ FIXED: Get completed payments sorted by date
        const completedPayments = loan.Payments
          .filter(p => p.status === 'completed')
          .sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));

        let highestPaidEmi = 0;
        let paidEmiNumbers = [];

        if (completedPayments.length > 0) {
          // Try to get emiNumber from payments
          const existingEmiNumbers = completedPayments
            .filter(p => p.emiNumber != null && p.emiNumber > 0)
            .map(p => p.emiNumber);

          if (existingEmiNumbers.length > 0) {
            // ✅ Use existing emiNumbers if available
            highestPaidEmi = Math.max(...existingEmiNumbers);
            paidEmiNumbers = existingEmiNumbers;

            console.log(`✅ Loan ${loan.id}: Using existing EMI numbers`);
            console.log(`   Highest EMI: ${highestPaidEmi}`);
          } else {
            // ✅ FALLBACK: Calculate EMI numbers based on payment order
            highestPaidEmi = completedPayments.length;
            paidEmiNumbers = Array.from(
              { length: completedPayments.length },
              (_, i) => i + 1
            );

            console.log(`📊 Loan ${loan.id}: Calculated EMI numbers from payment order`);
            console.log(`   Completed Payments: ${completedPayments.length}`);
            console.log(`   Calculated Highest EMI: ${highestPaidEmi}`);
          }
        } else {
          console.log(`⚠️ Loan ${loan.id}: No completed payments found`);
        }

        return {
          ...covenant.toJSON(),
          Loan: {
            ...loan.toJSON(),
            totalPayments: Math.max(completedTasks, completedPayments.length),
            highestPaidEmi: highestPaidEmi,
            paidEmiNumbers: paidEmiNumbers,
            completedPaymentsCount: completedPayments.length,
            completedTasksCount: completedTasks
          }
        };
      }

      return covenant.toJSON();
    })
  );

  res.json({
    success: true,
    count: covenantsWithPayments.length,
    data: covenantsWithPayments
  });
});


// ✅ UPDATE COVENANT (FIXED - ADDED AGENT PERMISSION)
exports.updateCovenant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (req.user.role !== 'admin' && req.user.role !== 'agent') {
    throw new AuthorizationError('Only admins and agents can update covenants');
  }

  const covenant = await Covenant.findByPk(id);
  if (!covenant) {
    throw new NotFoundError('Covenant not found');
  }

  if (updates.status) {
    updates.lastChecked = new Date();
  }

  await covenant.update(updates);

  const updatedCovenant = await Covenant.findByPk(id, {
    include: [
      {
        model: Loan,
        attributes: ['id', 'amount', 'status', 'recoveryStatus'],
        include: [
          {
            model: Customer,
            attributes: ['id', 'name']
          }
        ]
      }
    ]
  });

  res.json({
    success: true,
    message: 'Covenant updated successfully',
    data: updatedCovenant
  });
});

// ✅ GET COVENANT AUDIT TRAIL (UNCHANGED - KEEPS YOUR EXISTING LOGIC)
exports.getCovenantAuditTrail = asyncHandler(async (req, res) => {
  const { covenantId } = req.params;

  const audits = await CovenantAudit.findAll({
    where: { covenantId },
    order: [['checkDate', 'DESC']]
  });

  res.json({
    success: true,
    count: audits.length,
    data: audits
  });
});
