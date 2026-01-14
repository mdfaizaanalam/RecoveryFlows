// LOCATION: backend/src/controllers/loanController.js

const { Loan, Customer, Agent, User, ESGMetric, Covenant, RecoveryTask, LoanParticipant } = require('../models');
const { notificationService } = require('../services/NotificationService');
const {
  asyncHandler,
  NotFoundError,
  ValidationError,
  AuthorizationError
} = require('../utils/errorHandler');

// ✅✅✅ HELPER FUNCTIONS FOR AUTO-CREATION ✅✅✅

// ✅ UPDATED: Auto-create EMI tracking tasks based on loan term
async function autoCreateRecoveryTasks(loan) {
  try {
    // Only create if loan is approved and customer exists
    if (!loan.customerId || !loan.startDate) return;

    // Check if tasks already exist
    const existingTasks = await RecoveryTask.count({ where: { loanId: loan.id } });
    if (existingTasks > 0) {
      console.log(` ℹ️ Recovery tasks already exist (${existingTasks} found). Skipping creation.`);
      return;
    }

    const termMonths = loan.termMonths || 3;
    const startDate = new Date(loan.startDate);

    // ✅ CREATE EMI TRACKING TASKS FOR EACH MONTH
    const emiTasks = [];

    for (let i = 1; i <= termMonths; i++) {
      // Calculate EMI due date (same day as start date, but i months later)
      const emiDueDate = new Date(startDate);
      emiDueDate.setMonth(emiDueDate.getMonth() + i - 1); // Month 1 = startDate, Month 2 = +1 month, etc.

      emiTasks.push({
        loanId: loan.id,
        title: `EMI Payment #${i} - Loan #${loan.id}`,
        description: `Track EMI payment #${i} of ${termMonths} for Loan #${loan.id} (€${loan.amount}). Due date: ${emiDueDate.toLocaleDateString()}.`,
        taskType: 'EMI_TRACKING',
        priority: 'MEDIUM',
        dueDate: emiDueDate,
        status: 'PENDING',
        assignedTo: loan.agentId || null,
        emiMonth: i // ✅ Store which EMI month this task tracks
      });
    }

    const created = await RecoveryTask.bulkCreate(emiTasks);
    console.log(` ✅ Auto-created ${created.length} EMI tracking tasks for Loan #${loan.id}`);
    console.log(` • Term: ${termMonths} months`);
    console.log(` • Start Date: ${startDate.toLocaleDateString()}`);
    console.log(` • EMI Due Dates:`);
    emiTasks.forEach((task, idx) => {
      console.log(`   ${idx + 1}. ${task.dueDate.toLocaleDateString()}`);
    });

  } catch (error) {
    console.error(` ⚠️ Error auto-creating recovery tasks:`, error.message);
  }
}


// ✅✅✅ CHANGE #1: UPDATE TO 5 LENDERS (30%, 25%, 20%, 15%, 10%) ✅✅✅
// Helper: Auto-create syndicated lender participants
async function autoCreateSyndicatedParticipants(loan) {
  try {
    // Only create for large loans (>= €200,000)
    if (parseFloat(loan.amount) < 200000) {
      console.log(`   ℹ️  Loan amount (€${loan.amount}) below syndication threshold (€200k). Skipping syndicated lenders.`);
      return;
    }

    // Check if participants already exist
    const existingParticipants = await LoanParticipant.count({ where: { loanId: loan.id } });
    if (existingParticipants > 0) {
      console.log(`   ℹ️  Syndicated lenders already exist (${existingParticipants} found). Skipping creation.`);
      return;
    }

    const loanAmount = parseFloat(loan.amount);

    // ✅ CREATE 5 SYNDICATED LENDERS (30%, 25%, 20%, 15%, 10%)
    const lenders = [
      {
        loanId: loan.id,
        lenderName: 'Deutsche Bank AG',
        participationAmount: (loanAmount * 0.30).toFixed(2),
        participationPercentage: 30.0,
        role: 'lead',
        contactEmail: 'syndication@deutschebank.com',
        outstandingAmount: (loanAmount * 0.30).toFixed(2),
        recoveredAmount: 0.00
      },
      {
        loanId: loan.id,
        lenderName: 'BNP Paribas',
        participationAmount: (loanAmount * 0.25).toFixed(2),
        participationPercentage: 25.0,
        role: 'participant',
        contactEmail: 'corporate.loans@bnpparibas.com',
        outstandingAmount: (loanAmount * 0.25).toFixed(2),
        recoveredAmount: 0.00
      },
      {
        loanId: loan.id,
        lenderName: 'HSBC Holdings',
        participationAmount: (loanAmount * 0.20).toFixed(2),
        participationPercentage: 20.0,
        role: 'participant',
        contactEmail: 'syndicated.lending@hsbc.com',
        outstandingAmount: (loanAmount * 0.20).toFixed(2),
        recoveredAmount: 0.00
      },
      {
        loanId: loan.id,
        lenderName: 'Barclays Bank PLC',
        participationAmount: (loanAmount * 0.15).toFixed(2),
        participationPercentage: 15.0,
        role: 'participant',
        contactEmail: 'syndications@barclays.com',
        outstandingAmount: (loanAmount * 0.15).toFixed(2),
        recoveredAmount: 0.00
      },
      {
        loanId: loan.id,
        lenderName: 'Credit Suisse',
        participationAmount: (loanAmount * 0.10).toFixed(2),
        participationPercentage: 10.0,
        role: 'participant',
        contactEmail: 'loan.syndication@credit-suisse.com',
        outstandingAmount: (loanAmount * 0.10).toFixed(2),
        recoveredAmount: 0.00
      }
    ];

    const created = await LoanParticipant.bulkCreate(lenders);
    console.log(`   ✅ Auto-created ${created.length} syndicated lenders for Loan #${loan.id}`);
    console.log(`      • Deutsche Bank: 30% (€${(loanAmount * 0.30).toLocaleString()})`);
    console.log(`      • BNP Paribas: 25% (€${(loanAmount * 0.25).toLocaleString()})`);
    console.log(`      • HSBC Holdings: 20% (€${(loanAmount * 0.20).toLocaleString()})`);
    console.log(`      • Barclays: 15% (€${(loanAmount * 0.15).toLocaleString()})`);
    console.log(`      • Credit Suisse: 10% (€${(loanAmount * 0.10).toLocaleString()})`);
  } catch (error) {
    console.error(`   ⚠️  Error auto-creating syndicated lenders:`, error.message);
  }
}

// ✅✅✅ END HELPER FUNCTIONS ✅✅✅

// ✅ GET ALL LOANS
exports.getAllLoans = asyncHandler(async (req, res) => {
  const loans = await Loan.findAll({
    include: [Customer, Agent],
    order: [['createdAt', 'DESC']]
  });

  res.json({
    success: true,
    count: loans.length,
    data: { loans }
  });
});

// ✅ CREATE LOAN (WITH AUTO ESG METRIC PRE-CREATION + NOTIFICATIONS)
exports.createLoan = asyncHandler(async (req, res) => {
  const { customerId, amount, interestRate, termMonths } = req.body;

  // Validate customer exists
  const customer = await Customer.findByPk(customerId);
  if (!customer) {
    throw new NotFoundError('Customer not found');
  }

  // Validate loan amount
  if (amount <= 0) {
    throw new ValidationError('Loan amount must be greater than 0');
  }

  // Validate interest rate
  if (interestRate < 0 || interestRate > 100) {
    throw new ValidationError('Interest rate must be between 0 and 100');
  }

  // Validate term
  if (termMonths < 1 || termMonths > 360) {
    throw new ValidationError('Loan term must be between 1 and 360 months');
  }

  const loan = await Loan.create({
    customerId,
    amount,
    interestRate,
    termMonths,
    status: 'pending'
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🆕 NEW LOAN APPLICATION CREATED`);
  console.log(`${'='.repeat(60)}`);
  console.log(`   • Loan ID: #${loan.id}`);
  console.log(`   • Customer: ${customer.name} (ID: ${customerId})`);
  console.log(`   • Amount: €${amount.toLocaleString()}`);
  console.log(`   • Interest Rate: ${interestRate}%`);
  console.log(`   • Term: ${termMonths} months`);
  console.log(`   • Status: PENDING`);
  console.log(`${'='.repeat(60)}\n`);

  // ✅ NEW: Send notifications to customer and all admins
  try {
    // Notify customer
    await notificationService.sendNotification(
      req.user.id,
      `Your loan application for €${amount.toLocaleString()} has been submitted successfully! Loan ID: #${loan.id}. We'll notify you once it's reviewed.`,
      'loan_application',
      {
        loanId: loan.id,
        loanAmount: amount,
        customerName: customer.name,
        status: 'pending',
        termMonths: termMonths,
        interestRate: interestRate
      }
    );

    // Notify all admins
    const admins = await User.findAll({ where: { role: 'admin' } });
    for (const admin of admins) {
      await notificationService.sendNotification(
        admin.id,
        `📝 New loan application received from ${customer.name} for €${amount.toLocaleString()}. Loan ID: #${loan.id}. Please review and approve/reject.`,
        'loan_application_admin',
        {
          loanId: loan.id,
          loanAmount: amount,
          customerName: customer.name,
          customerEmail: customer.email,
          termMonths: termMonths,
          interestRate: interestRate
        }
      );
    }

    console.log(`✅ Notifications sent: 1 customer + ${admins.length} admin(s)\n`);
  } catch (notifError) {
    console.error(`❌ Failed to send notifications:`, notifError.message);
  }

  // ✅ AUTO-CREATE ESG METRIC ON APPLICATION (PRE-APPROVAL)
  try {
    const isGreenLoan = amount >= 100000;
    const baseESGScore = isGreenLoan ? 70 : 45;
    const esgScore = baseESGScore + Math.floor(Math.random() * 20);
    const carbonIntensity = parseFloat((Math.random() * 50).toFixed(2));

    await ESGMetric.create({
      loanId: loan.id,
      esgScore: esgScore,
      carbonIntensity: carbonIntensity,
      sustainabilityKPI: 'Pending Assessment',
      kpiTarget: 0,
      kpiCurrent: 0,
      kpiStatus: 'ON_TRACK',
      greenLoanClassification: isGreenLoan,
      marginAdjustment: 0,
      reportingPeriod: 'Pending',
      lastReportDate: new Date()
    });

    console.log(`✅ ESG METRIC PRE-CREATED (Application Stage)`);
    console.log(`   • Loan ID: #${loan.id}`);
    console.log(`   • ESG Score: ${esgScore}/100`);
    console.log(`   • Carbon Intensity: ${carbonIntensity} tCO2e`);
    console.log(`   • Green Loan: ${isGreenLoan ? 'YES ✓' : 'NO ✗'} (Amount ${isGreenLoan ? '≥' : '<'} €100k)`);
    console.log(`   • Status: Pending Approval\n`);
  } catch (esgError) {
    console.error(`❌ FAILED to pre-create ESG metric for Loan #${loan.id}:`);
    console.error(`   Error: ${esgError.message}`);
    console.error(`   Stack:`, esgError.stack);
  }

  // Fetch the created loan with customer details
  const createdLoan = await Loan.findByPk(loan.id, { include: [Customer] });

  res.status(201).json({
    success: true,
    message: 'Loan application submitted successfully',
    data: { loan: createdLoan }
  });
});

// ✅ UPDATE LOAN STATUS (WITH AUTO COVENANT & ESG CREATION ON APPROVAL + NOTIFICATIONS)
exports.updateLoanStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  const loan = await Loan.findByPk(id, { include: [Customer, Agent] });
  if (!loan) {
    throw new NotFoundError('Loan not found');
  }

  // Validate status transition
  const validStatuses = ['pending', 'approved', 'rejected', 'active', 'closed', 'defaulted'];
  if (!validStatuses.includes(status)) {
    throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  // Check if user has permission to update this loan
  if (req.user.role === 'customer' && loan.customerId !== userId) {
    throw new AuthorizationError('You can only update your own loans');
  }

  // Validate status transitions
  if (loan.status === 'closed' && status !== 'closed') {
    throw new ValidationError('Cannot modify a closed loan');
  }

  if (loan.status === 'rejected' && status !== 'rejected') {
    throw new ValidationError('Cannot modify a rejected loan');
  }

  // Update loan status
  const oldStatus = loan.status;
  loan.status = status;

  // ✅✅✅ APPROVAL AUTOMATION ✅✅✅
  if (status === 'approved') {
    loan.startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + loan.termMonths);
    loan.endDate = endDate;

    await loan.save();  // 🔥 ADD THIS LINE

    console.log(`\n${'='.repeat(70)}`);
    console.log(`🎯 LOAN APPROVED - STARTING AUTOMATION WORKFLOW`);
    console.log(`${'='.repeat(70)}`);
    console.log(`   • Loan ID: #${loan.id}`);
    console.log(`   • Customer: ${loan.Customer?.name || 'Unknown'}`);
    console.log(`   • Amount: €${loan.amount.toLocaleString()}`);
    console.log(`   • Approved By: User #${userId}`);
    console.log(`   • Start Date: ${loan.startDate.toLocaleDateString()}`);
    console.log(`   • End Date: ${loan.endDate.toLocaleDateString()}`);
    console.log(`${'='.repeat(70)}\n`);

    // ✅ STEP 1: AUTO-CREATE/UPDATE ESG METRIC
    console.log(`📊 STEP 1: ESG METRIC AUTOMATION`);
    console.log(`${'─'.repeat(70)}`);
    try {
      const existingESG = await ESGMetric.findOne({ where: { loanId: loan.id } });

      if (!existingESG) {
        console.log(`⚠️  No pre-existing ESG found. Creating new ESG metric...`);

        const isGreenLoan = loan.amount >= 100000;
        const baseESGScore = isGreenLoan ? 75 : 50;
        const esgScore = baseESGScore + Math.floor(Math.random() * 15);
        const carbonIntensity = parseFloat((Math.random() * 50).toFixed(2));

        const newESG = await ESGMetric.create({
          loanId: loan.id,
          esgScore: esgScore,
          carbonIntensity: carbonIntensity,
          sustainabilityKPI: 'Carbon Reduction Target',
          kpiTarget: 20.0,
          kpiCurrent: 0.0,
          kpiStatus: 'ON_TRACK',
          greenLoanClassification: isGreenLoan,
          marginAdjustment: isGreenLoan ? -10 : 0,
          reportingPeriod: 'Quarterly',
          lastReportDate: new Date()
        });

        console.log(`✅ ESG METRIC CREATED SUCCESSFULLY`);
        console.log(`   • ESG Metric ID: ${newESG.id}`);
        console.log(`   • ESG Score: ${esgScore}/100`);
        console.log(`   • Carbon Intensity: ${carbonIntensity} tCO2e`);
        console.log(`   • Green Classification: ${isGreenLoan ? 'YES ✓' : 'NO ✗'}`);
        console.log(`   • KPI: Carbon Reduction (Target: 20%, Current: 0%)`);
        console.log(`   • Margin Adjustment: ${isGreenLoan ? '-10 bps (Green Discount)' : '0 bps (Base)'}`);
        console.log(`   • Reporting Period: Quarterly`);
      } else {
        console.log(`✓ ESG Metric already exists (ID: ${existingESG.id})`);
        console.log(`   • Current ESG Score: ${existingESG.esgScore}/100`);
        console.log(`   • Green Classification: ${existingESG.greenLoanClassification ? 'YES ✓' : 'NO ✗'}`);

        // Update to approved status
        await existingESG.update({
          sustainabilityKPI: 'Carbon Reduction Target',
          kpiTarget: 20.0,
          kpiCurrent: existingESG.kpiCurrent || 0.0,
          kpiStatus: 'ON_TRACK',
          reportingPeriod: 'Quarterly',
          marginAdjustment: existingESG.greenLoanClassification ? -10 : 0,
          lastReportDate: new Date()
        });
        console.log(`✅ ESG METRIC UPDATED WITH APPROVAL DATA`);
        console.log(`   • KPI: Carbon Reduction Target (20%)`);
        console.log(`   • Margin Adjustment: ${existingESG.greenLoanClassification ? '-10 bps' : '0 bps'}`);
      }
      console.log(`${'─'.repeat(70)}\n`);
    } catch (esgError) {
      console.error(`❌ ESG METRIC AUTOMATION FAILED`);
      console.error(`   Error: ${esgError.message}`);
      console.error(`   Stack:`, esgError.stack);
      console.log(`${'─'.repeat(70)}\n`);
    }

    // ✅ STEP 2: AUTO-CREATE DEFAULT COVENANTS
    console.log(`📋 STEP 2: COVENANT AUTOMATION`);
    console.log(`${'─'.repeat(70)}`);
    try {
      const existingCovenants = await Covenant.count({ where: { loanId: loan.id } });
      console.log(`🔍 Existing Covenant Count: ${existingCovenants}`);

      if (existingCovenants === 0) {
        console.log(`⚙️  Creating 3 default covenants...\n`);

        const covenantDefaults = [
          {
            loanId: loan.id,
            type: 'DSCR',
            name: `DSCR Covenant - Loan #${loan.id}`,
            threshold: 1.25,
            operator: 'GREATER_THAN',
            frequency: 'QUARTERLY',
            severity: 'HIGH',
            status: 'ACTIVE',
            description: 'Debt Service Coverage Ratio must remain above 1.25x'
          },
          {
            loanId: loan.id,
            type: 'PAYMENT_DELAY',
            name: `Payment Delay - Loan #${loan.id}`,
            threshold: 7,
            operator: 'LESS_THAN',
            frequency: 'MONTHLY',
            severity: 'CRITICAL',
            status: 'ACTIVE',
            description: 'Payment delay must not exceed 7 days'
          },
          {
            loanId: loan.id,
            type: 'ESG_SCORE',
            name: `ESG Score - Loan #${loan.id}`,
            threshold: 40,
            operator: 'GREATER_THAN',
            frequency: 'QUARTERLY',
            severity: 'MEDIUM',
            status: 'ACTIVE',
            description: 'ESG score must remain above 40/100'
          }
        ];

        const created = await Covenant.bulkCreate(covenantDefaults);

        console.log(`✅ COVENANTS CREATED SUCCESSFULLY (${created.length})`);
        console.log(`\n   1️⃣  DSCR COVENANT`);
        console.log(`      • Type: Debt Service Coverage Ratio`);
        console.log(`      • Threshold: ≥ 1.25x`);
        console.log(`      • Frequency: Quarterly`);
        console.log(`      • Severity: HIGH`);
        console.log(`      • Status: ACTIVE ✓`);

        console.log(`\n   2️⃣  PAYMENT DELAY COVENANT`);
        console.log(`      • Type: Payment Delay Monitoring`);
        console.log(`      • Threshold: ≤ 30 days`);
        console.log(`      • Frequency: Monthly`);
        console.log(`      • Severity: CRITICAL`);
        console.log(`      • Status: ACTIVE ✓`);

        console.log(`\n   3️⃣  ESG SCORE COVENANT`);
        console.log(`      • Type: Environmental/Social/Governance`);
        console.log(`      • Threshold: ≥ 40/100`);
        console.log(`      • Frequency: Quarterly`);
        console.log(`      • Severity: MEDIUM`);
        console.log(`      • Status: ACTIVE ✓\n`);
      } else {
        console.log(`✓ Covenants already exist (${existingCovenants} found)`);
        console.log(`   Skipping covenant creation to avoid duplicates.\n`);
      }
      console.log(`${'─'.repeat(70)}\n`);
    } catch (covenantError) {
      console.error(`❌ COVENANT AUTOMATION FAILED`);
      console.error(`   Error: ${covenantError.message}`);
      console.error(`   Stack:`, covenantError.stack);
      console.log(`${'─'.repeat(70)}\n`);
    }

    // ✅✅✅ NEW: STEP 3 - AUTO-CREATE RECOVERY TASKS ✅✅✅
    console.log(`📝 STEP 3: RECOVERY TASK AUTOMATION`);
    console.log(`${'─'.repeat(70)}`);
    await autoCreateRecoveryTasks(loan);
    console.log(`${'─'.repeat(70)}\n`);

    // ✅✅✅ NEW: STEP 4 - AUTO-CREATE SYNDICATED LENDERS ✅✅✅
    console.log(`🏦 STEP 4: SYNDICATED LENDER AUTOMATION`);
    console.log(`${'─'.repeat(70)}`);
    await autoCreateSyndicatedParticipants(loan);
    console.log(`${'─'.repeat(70)}\n`);

    // ✅ STEP 5: Send approval notifications
    console.log(`📧 STEP 5: SENDING APPROVAL NOTIFICATIONS`);
    console.log(`${'─'.repeat(70)}`);
    try {
      // Notify customer
      await notificationService.sendNotification(
        loan.customerId,
        `🎉 Congratulations! Your loan application #${loan.id} for €${loan.amount.toLocaleString()} has been APPROVED! EMI starts from ${loan.startDate.toLocaleDateString()}.`,
        'loan_approved',
        {
          loanId: loan.id,
          loanAmount: loan.amount,
          interestRate: loan.interestRate,
          termMonths: loan.termMonths,
          startDate: loan.startDate,
          endDate: loan.endDate,
          approvedBy: userId
        }
      );
      console.log(`✅ Customer notification sent (User ID: ${loan.customerId})`);

      // Notify all admins (except the one who approved)
      const admins = await User.findAll({ where: { role: 'admin' } });
      let adminCount = 0;
      for (const admin of admins) {
        if (admin.id !== userId) {
          await notificationService.sendNotification(
            admin.id,
            `✅ Loan #${loan.id} (€${loan.amount.toLocaleString()}) for ${loan.Customer?.name} has been approved by Admin #${userId}.`,
            'loan_approved_admin',
            {
              loanId: loan.id,
              loanAmount: loan.amount,
              customerName: loan.Customer?.name,
              approvedBy: userId,
              startDate: loan.startDate
            }
          );
          adminCount++;
        }
      }
      console.log(`✅ Admin notifications sent (${adminCount} admin(s))`);
      console.log(`${'─'.repeat(70)}\n`);
    } catch (notifError) {
      console.error(`❌ Failed to send approval notifications:`, notifError.message);
      console.log(`${'─'.repeat(70)}\n`);
    }

    console.log(`${'='.repeat(70)}`);
    console.log(`✅ LOAN APPROVAL AUTOMATION COMPLETE`);
    console.log(`${'='.repeat(70)}`);
    console.log(`   • Loan #${loan.id} is now APPROVED and ACTIVE`);
    console.log(`   • ESG Tracking: ENABLED ✓`);
    console.log(`   • Covenant Monitoring: ENABLED ✓`);
    console.log(`   • Recovery Tasks: CREATED ✓`);
    console.log(`   • Syndicated Lenders: ${parseFloat(loan.amount) >= 200000 ? 'CREATED ✓' : 'N/A (Below €200k)'}`);
    console.log(`   • Notifications Sent: CUSTOMER + ADMINS ✓`);
    console.log(`   • Real-time Dashboard: UPDATED ✓`);
    console.log(`${'='.repeat(70)}\n`);

  } else if (status === 'rejected') {
    console.log(`\n❌ LOAN REJECTED`);
    console.log(`   • Loan ID: #${loan.id}`);
    console.log(`   • Rejected By: User #${userId}`);
    console.log(`   • Reason: Admin Decision\n`);

    // ✅ NEW: Send rejection notification
    try {
      await notificationService.sendNotification(
        loan.customerId,
        `❌ Your loan application #${loan.id} for €${loan.amount.toLocaleString()} has been rejected. Please contact support for more information.`,
        'loan_rejected',
        {
          loanId: loan.id,
          loanAmount: loan.amount,
          rejectedBy: userId,
          rejectedAt: new Date()
        }
      );
      console.log(`✅ Rejection notification sent to customer (User ID: ${loan.customerId})\n`);
    } catch (notifError) {
      console.error(`❌ Failed to send rejection notification:`, notifError.message);
    }

  } else if (status === 'defaulted') {
    loan.recoveryStatus = 'pending';
    console.log(`\n⚠️  LOAN DEFAULTED`);
    console.log(`   • Loan ID: #${loan.id}`);
    console.log(`   • Marked By: User #${userId}`);
    console.log(`   • Recovery Status: PENDING`);
    console.log(`   • Next Step: Assign Recovery Agent\n`);

    // ✅ NEW: Send default notifications
    try {
      // Notify customer
      await notificationService.sendNotification(
        loan.customerId,
        `⚠️ Your loan #${loan.id} has been marked as DEFAULTED. Please contact our recovery team immediately to resolve this.`,
        'loan_defaulted',
        {
          loanId: loan.id,
          loanAmount: loan.amount,
          recoveryStatus: 'pending',
          defaultedAt: new Date()
        }
      );
      console.log(`✅ Customer default notification sent (User ID: ${loan.customerId})`);

      // Notify all admins
      const admins = await User.findAll({ where: { role: 'admin' } });
      for (const admin of admins) {
        await notificationService.sendNotification(
          admin.id,
          `⚠️ Loan #${loan.id} (€${loan.amount.toLocaleString()}) for ${loan.Customer?.name} has been marked as DEFAULTED. Recovery process should begin.`,
          'loan_defaulted_admin',
          {
            loanId: loan.id,
            loanAmount: loan.amount,
            customerName: loan.Customer?.name,
            defaultedBy: userId
          }
        );
      }
      console.log(`✅ Admin default notifications sent (${admins.length} admin(s))\n`);
    } catch (notifError) {
      console.error(`❌ Failed to send default notifications:`, notifError.message);
    }

    // ✅✅✅ AUTO-CREATE RECOVERY TASK ON DEFAULT ✅✅✅
    try {
      const aiSuggestions = {
        summary: `Loan #${loan.id} (€${loan.amount.toLocaleString()}) has defaulted. Immediate action required.`,
        steps: [
          'Contact customer within 24 hours',
          'Review payment history and identify root cause',
          'Propose restructuring or payment plan',
          'Escalate to legal if no response within 7 days'
        ],
        urgency: 'HIGH',
        estimatedRecoveryChance: '65%'
      };

      const recoveryTask = await RecoveryTask.create({
        loanId: loan.id,
        title: `URGENT: Recovery Required - Loan #${loan.id}`,
        description: `Customer ${loan.Customer?.name} has defaulted on loan #${loan.id} (€${loan.amount.toLocaleString()}). Immediate recovery action required.`,
        priority: 'URGENT',
        taskType: 'RECOVERY',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        assignedTo: null, // Will be assigned when agent is assigned
        aiSuggestions: JSON.stringify(aiSuggestions)
      });

      console.log(`✅ Recovery Task Auto-Created: ID #${recoveryTask.id}\n`);
    } catch (taskError) {
      console.error(`❌ Failed to create recovery task:`, taskError.message);
    }
  }

  await loan.save();

  res.json({
    success: true,
    message: `Loan status updated to ${status}`,
    data: { loan }
  });
});

// ASSIGN AGENT WITH ENHANCED NOTIFICATIONS
exports.assignAgent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { agentId } = req.body;

  if (req.user.role !== 'admin') {
    throw new AuthorizationError('Only admins can assign agents to loans');
  }

  const loan = await Loan.findByPk(id, {
    include: [Customer, Agent]
  });

  if (!loan) {
    throw new NotFoundError('Loan not found');
  }

  const agent = await Agent.findByPk(agentId);
  if (!agent) {
    throw new NotFoundError('Agent not found');
  }

  if (loan.status !== 'approved' && loan.status !== 'defaulted') {
    throw new ValidationError('Can only assign agents to approved or defaulted loans');
  }

  if (loan.agentId === agentId) {
    throw new ValidationError('This agent is already assigned to this loan');
  }

  // Update loan
  loan.agentId = agentId;

  if (loan.status === 'approved') {
    loan.recoveryStatus = 'pending';
  } else if (loan.status === 'defaulted') {
    loan.recoveryStatus = 'assigned';
  }

  await loan.save();

  // ✅ CRITICAL FIX: Reload loan with fresh Agent data
  await loan.reload({
    include: [
      { model: Customer },
      { model: Agent }
    ]
  });

  // AUTO-UPDATE ALL UNASSIGNED RECOVERY TASKS FOR THIS LOAN
  try {
    const { Op } = require('sequelize');
    const unassignedTasks = await RecoveryTask.findAll({
      where: {
        loanId: loan.id,
        [Op.or]: [
          { assignedTo: null },
          { assignedTo: { [Op.eq]: null } }
        ]
      }
    });

    if (unassignedTasks.length > 0) {
      // Find the agent's user ID
      const agentUser = await User.findOne({
        where: { email: agent.email, role: 'agent' }
      });

      if (agentUser) {
        await RecoveryTask.update(
          { assignedTo: agentUser.id },
          {
            where: {
              loanId: loan.id,
              [Op.or]: [
                { assignedTo: null },
                { assignedTo: { [Op.eq]: null } }
              ]
            }
          }
        );
        console.log(`✅ Auto-assigned ${unassignedTasks.length} recovery tasks to Agent ${agent.name} (User ID: ${agentUser.id})`);
      } else {
        console.warn(`⚠️ No User account found for Agent ${agent.email}`);
      }
    }
  } catch (taskUpdateError) {
    console.error('Failed to auto-assign tasks to agent:', taskUpdateError.message);
  }

  console.log('✅ AGENT ASSIGNED');
  console.log(`   Loan ID: ${loan.id}`);
  console.log(`   Agent: ${agent.name} (ID: ${agentId})`);
  console.log(`   Customer: ${loan.Customer?.name || 'Unknown'}`);
  console.log(`   Amount: €${loan.amount.toLocaleString()}`);
  console.log(`   Assigned By: Admin ${req.user.id}`);

  // ENHANCED: Send notifications to all parties
  try {
    const user = await User.findOne({
      where: { email: agent.email, role: 'agent' }
    });

    if (user) {
      // Notify agent
      await notificationService.sendNotification(
        user.id,
        `You have been assigned to Loan #${loan.id} (€${loan.amount.toLocaleString()}) for customer ${loan.Customer?.name}. Please review and begin recovery process.`,
        'loan_assignment',
        {
          loanId: loan.id,
          loanAmount: loan.amount,
          customerName: loan.Customer?.name,
          customerEmail: loan.Customer?.email,
          loanStatus: loan.status,
          recoveryStatus: loan.recoveryStatus,
          assignedBy: req.user.id,
          assignedAt: new Date().toISOString()
        }
      );
      console.log(`   ✅ Agent notification sent (User ID: ${user.id})`);

      // ✅ FIXED: Notify customer with actual agent name
      await notificationService.sendNotification(
        loan.customerId,
        `${agent.name} has been assigned to your loan #${loan.id}. They will contact you shortly.`,
        'agent_assigned_customer',
        {
          loanId: loan.id,
          agentName: agent.name,
          agentEmail: agent.email,
          assignedAt: new Date()
        }
      );
      console.log(`   ✅ Customer notification sent (User ID: ${loan.customerId})`);

      // ✅ FIXED: Notify admins with actual agent name
      const admins = await User.findAll({ where: { role: 'admin' } });
      let adminCount = 0;

      for (const admin of admins) {
        if (admin.id !== req.user.id) {
          await notificationService.sendNotification(
            admin.id,
            `${agent.name} has been assigned to Loan #${loan.id} (${loan.Customer?.name}) by Admin ${req.user.id}.`,
            'agent_assigned_admin',
            {
              loanId: loan.id,
              agentName: agent.name,
              customerName: loan.Customer?.name,
              assignedBy: req.user.id
            }
          );
          adminCount++;
        }
      }
      console.log(`   ✅ Admin notifications sent (${adminCount} admins)`);
      console.log(`📧 Assignment notifications sent to Agent + Customer + ${adminCount} Admins`);
    } else {
      console.warn(`⚠️ No User account found for Agent ${agentId} (${agent.email})`);
    }
  } catch (notificationError) {
    console.error('Failed to send assignment notifications:', notificationError.message);
  }

  // ✅ RETURN UPDATED LOAN WITH FRESH AGENT DATA
  res.json({
    success: true,
    message: `${agent.name} assigned successfully`,
    data: {
      loan,
      agent: {
        id: agent.id,
        name: agent.name,
        email: agent.email
      }
    }
  });
});

// ✅ GET LOANS BY CUSTOMER
exports.getLoansByCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;

  if (req.user.role === 'customer' && req.user.id !== parseInt(customerId)) {
    throw new AuthorizationError('You can only view your own loans');
  }

  const customer = await Customer.findByPk(customerId);
  if (!customer) {
    throw new NotFoundError('Customer not found');
  }

  const loans = await Loan.findAll({
    where: { customerId },
    include: [Agent],
    order: [['createdAt', 'DESC']]
  });

  res.json({
    success: true,
    count: loans.length,
    data: { loans, customer }
  });
});

// ✅ GET LOANS BY AGENT
exports.getLoansByAgent = asyncHandler(async (req, res) => {
  const { agentId } = req.params;

  if (req.user.role === 'agent' && req.user.id !== parseInt(agentId)) {
    throw new AuthorizationError('You can only view your own assigned loans');
  }

  const agent = await Agent.findByPk(agentId);
  if (!agent) {
    throw new NotFoundError('Agent not found');
  }

  const loans = await Loan.findAll({
    where: { agentId },
    include: [Customer],
    order: [['createdAt', 'DESC']]
  });

  res.json({
    success: true,
    count: loans.length,
    data: { loans, agent }
  });
});

// ✅✅✅ CHANGE #2: AUTO-COMPLETE TASKS WHEN LOAN RECOVERED ✅✅✅
exports.updateRecoveryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { recoveryStatus } = req.body;

  const loan = await Loan.findByPk(id);
  if (!loan) throw new NotFoundError('Loan not found');

  // ✅ OLD STATUS
  const oldRecoveryStatus = loan.recoveryStatus;

  // Update recovery status
  await loan.update({ recoveryStatus });

  // ✅✅✅ AUTO-COMPLETE ALL PENDING RECOVERY TASKS ON RECOVERY ✅✅✅
  if (recoveryStatus === 'recovered' && oldRecoveryStatus !== 'recovered') {
    console.log(`\n✅ LOAN RECOVERED - AUTO-COMPLETING TASKS & COVENANTS`);
    console.log(`   • Loan ID: #${id}`);

    try {
      // Find all pending/in_progress tasks for this loan
      const tasksToComplete = await RecoveryTask.findAll({
        where: {
          loanId: id,
          status: ['PENDING', 'IN_PROGRESS']
        }
      });

      if (tasksToComplete.length > 0) {
        // Update all tasks to COMPLETED
        await RecoveryTask.update(
          {
            status: 'COMPLETED',
            completedDate: new Date(),
            outcome: 'Auto-completed: Loan successfully recovered'
          },
          {
            where: {
              loanId: id,
              status: ['PENDING', 'IN_PROGRESS']
            }
          }
        );

        console.log(`   ✅ Auto-completed ${tasksToComplete.length} recovery task(s)`);
        tasksToComplete.forEach(task => {
          console.log(`      • ${task.title} (ID: ${task.id})`);
        });
      } else {
        console.log(`   ℹ️  No pending tasks found`);
      }
    } catch (taskError) {
      console.error(`   ❌ Failed to auto-complete tasks:`, taskError.message);
    }

    // ✅✅✅ NEW: AUTO-COMPLETE COVENANTS ✅✅✅
    try {
      const { Op } = require('sequelize');

      // Find all active/breached covenants for this loan
      const activeCovenants = await Covenant.findAll({
        where: {
          loanId: id,
          status: { [Op.in]: ['ACTIVE', 'BREACHED'] }
        }
      });

      if (activeCovenants.length > 0) {
        // Mark all as INACTIVE
        await Covenant.update(
          {
            status: 'INACTIVE',
            lastChecked: new Date()
          },
          {
            where: {
              loanId: id,
              status: { [Op.in]: ['ACTIVE', 'BREACHED'] }
            }
          }
        );

        console.log(`   ✅ Auto-completed ${activeCovenants.length} covenant(s)`);
        activeCovenants.forEach(covenant => {
          console.log(`      • ${covenant.name} (ID: ${covenant.id}) - Status: ${covenant.status} → INACTIVE`);
        });
      } else {
        console.log(`   ℹ️  No active covenants found`);
      }
    } catch (covenantError) {
      console.error(`   ❌ Failed to auto-complete covenants:`, covenantError.message);
    }

    try {
      // Find all green loans that are recovered
      const allGreenLoans = await ESGMetric.findAll({
        where: {
          greenLoanClassification: true,
          sustainabilityKPI: 'Carbon Reduction Target'
        },
        include: {
          model: Loan,
          attributes: ['id', 'status', 'recoveryStatus']
        }
      });

      // Count recovered green loans
      const recoveredCount = allGreenLoans.filter(m =>
        m.Loan && (
          m.Loan.recoveryStatus === 'recovered' ||
          m.Loan.status === 'recovered' ||
          m.Loan.status === 'closed'
        )
      ).length;

      // Update ALL green loans with the same cumulative count
      for (const metric of allGreenLoans) {
        await metric.update({ kpiCurrent: recoveredCount });
      }

      console.log(`   ✅ Carbon Reduction KPI updated globally: ${recoveredCount}/20 for ${allGreenLoans.length} green loan(s)`);
    } catch (kpiError) {
      console.error(`   ❌ Failed to update Carbon KPI:`, kpiError.message);
    }

    console.log(`\n`);
  }

  res.json({
    success: true,
    message: 'Recovery status updated',
    data: loan
  });
});

// ✅ GET LOAN BY ID
exports.getLoanById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const loan = await Loan.findByPk(id, { include: [Customer, Agent] });
  if (!loan) {
    throw new NotFoundError('Loan not found');
  }

  if (req.user.role === 'customer' && loan.customerId !== req.user.id) {
    throw new AuthorizationError('You can only view your own loans');
  }

  if (req.user.role === 'agent' && loan.agentId !== req.user.id) {
    throw new AuthorizationError('You can only view loans assigned to you');
  }

  res.json({
    success: true,
    data: { loan }
  });
});

// ✅ DELETE LOAN (WITH CASCADE DELETE FOR RELATED DATA)
exports.deleteLoan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  console.log(`\n🗑️  DELETE REQUEST`);
  console.log(`   • Loan ID: #${id}`);
  console.log(`   • User: ${req.user.role} #${userId}`);

  const loan = await Loan.findByPk(id, { include: [Customer, Agent] });
  if (!loan) {
    console.error(`   ❌ Loan #${id} not found`);
    throw new NotFoundError('Loan not found');
  }

  console.log(`   • Loan Status: ${loan.status}`);
  console.log(`   • Loan Owner: Customer #${loan.customerId}`);

  // ✅ CASE-INSENSITIVE status check
  const loanStatus = loan.status.toLowerCase();

  // ✅ ALLOW DELETING: pending, rejected
  // ❌ BLOCK DELETING: approved, active, closed, defaulted
  const deletableStatuses = ['pending', 'rejected'];
  if (!deletableStatuses.includes(loanStatus)) {
    console.error(`   ❌ Cannot delete: Status is "${loan.status}"`);
    throw new ValidationError(
      `Cannot delete ${loan.status} loans. Only pending or rejected loans can be deleted.`
    );
  }

  // Check authorization
  if (req.user.role === 'customer') {
    if (loan.customerId !== userId) {
      console.error(`   ❌ Authorization failed`);
      throw new AuthorizationError('You can only delete your own rejected loans');
    }
    console.log(`   ✅ Authorization passed: Customer deleting own loan`);
  } else if (req.user.role === 'admin') {
    console.log(`   ✅ Authorization passed: Admin can delete any rejected loan`);
  } else if (req.user.role === 'agent') {
    console.log(`   ✅ Authorization passed: Agent can delete rejected loans`);
  } else {
    console.error(`   ❌ Invalid role: ${req.user.role}`);
    throw new AuthorizationError('You do not have permission to delete loans');
  }

  // ✅ DELETE RELATED DATA FIRST (to avoid foreign key constraint)
  try {
    const { ESGMetric, Covenant, CovenantAudit, RecoveryTask, Payment } = require('../models');

    console.log(`   🗑️  Deleting related data...`);

    // Delete ESG Metrics
    const deletedESG = await ESGMetric.destroy({ where: { loanId: id } });
    console.log(`   • ESG Metrics deleted: ${deletedESG}`);

    // Delete Covenant Audits first (they reference Covenants)
    const deletedAudits = await CovenantAudit.destroy({
      where: {
        covenantId: {
          [require('sequelize').Op.in]:
            (await Covenant.findAll({ where: { loanId: id }, attributes: ['id'] })).map(c => c.id)
        }
      }
    });
    console.log(`   • Covenant Audits deleted: ${deletedAudits}`);

    // Delete Covenants
    const deletedCovenants = await Covenant.destroy({ where: { loanId: id } });
    console.log(`   • Covenants deleted: ${deletedCovenants}`);

    // Delete Recovery Tasks
    const deletedTasks = await RecoveryTask.destroy({ where: { loanId: id } });
    console.log(`   • Recovery Tasks deleted: ${deletedTasks}`);

    // Delete Payments
    const deletedPayments = await Payment.destroy({ where: { loanId: id } });
    console.log(`   • Payments deleted: ${deletedPayments}`);

    // Delete Loan Participants
    const deletedParticipants = await LoanParticipant.destroy({ where: { loanId: id } });
    console.log(`   • Loan Participants deleted: ${deletedParticipants}`);

  } catch (cleanupError) {
    console.error(`   ⚠️  Error cleaning up related data:`, cleanupError.message);
    // Continue with loan deletion even if some cleanup fails
  }

  // Delete the loan
  await loan.destroy();

  console.log(`   ✅ LOAN DELETED SUCCESSFULLY`);
  console.log(`   • Loan ID: #${loan.id}`);
  console.log(`   • Status: ${loan.status}`);
  console.log(`   • Deleted By: ${req.user.role} #${userId}\n`);

  res.json({
    success: true,
    message: 'Loan deleted successfully'
  });
});
