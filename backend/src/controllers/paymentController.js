// LOCATION: backend/src/controllers/paymentController.js

const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const Customer = require('../models/Customer');
const User = require('../models/User');
const { RecoveryTask } = require('../models');
const { notificationService } = require('../services/NotificationService');
const { asyncHandler } = require('../utils/errorHandler');


exports.getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.findAll({
    include: Loan,
    order: [['createdAt', 'DESC']]
  });

  res.json({
    success: true,
    count: payments.length,
    data: payments
  });
});


exports.createPayment = asyncHandler(async (req, res) => {
  const { loanId, amount } = req.body;

  const loan = await Loan.findByPk(loanId, {
    include: [Customer]
  });

  if (!loan) {
    return res.status(404).json({
      success: false,
      message: 'Loan not found'
    });
  }

  // ✅ Calculate EMI number
  const existingPaymentCount = await Payment.count({
    where: {
      loanId,
      status: 'completed'
    }
  });

  const emiNumber = existingPaymentCount + 1;

  const payment = await Payment.create({
    loanId,
    amount,
    paymentDate: new Date(),
    status: 'completed',
    emiNumber: emiNumber
  });

  console.log(`\n💰 PAYMENT RECEIVED`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`   • Payment ID: #${payment.id}`);
  console.log(`   • Loan ID: #${loanId}`);
  console.log(`   • EMI Number: #${emiNumber}`);
  console.log(`   • Amount: €${amount.toLocaleString()}`);
  console.log(`   • Customer: ${loan.Customer?.name || 'Unknown'}`);
  console.log(`${'─'.repeat(60)}\n`);

  // ✅ IMPROVED: AUTO-COMPLETE RECOVERY TASK
  try {
    console.log(`🔍 Searching for recovery task: Loan #${loanId}, EMI #${emiNumber}`);

    const recoveryTask = await RecoveryTask.findOne({
      where: {
        loanId: loanId,
        emiMonth: emiNumber,
        taskType: 'EMI_TRACKING'
      }
    });

    if (!recoveryTask) {
      console.log(`❌ NO TASK FOUND - Searching all tasks for this loan...`);

      // Debug: Show all tasks for this loan
      const allTasks = await RecoveryTask.findAll({
        where: { loanId: loanId, taskType: 'EMI_TRACKING' }
      });

      console.log(`📋 Found ${allTasks.length} EMI tasks for this loan:`);
      allTasks.forEach(t => {
        console.log(`   - Task #${t.id}: EMI Month ${t.emiMonth}, Status: ${t.status}`);
      });
    } else {
      console.log(`✅ Found Task #${recoveryTask.id} - Current Status: ${recoveryTask.status}`);

      if (recoveryTask.status === 'COMPLETED') {
        console.log(`ℹ️  Task already completed, skipping update`);
      } else {
        await recoveryTask.update({
          status: 'COMPLETED',
          completedDate: payment.paymentDate,
          outcome: `EMI #${emiNumber} paid successfully`
        });
        console.log(`✅ Task updated to COMPLETED!`);

        // Force reload to verify
        await recoveryTask.reload();
        console.log(`✅ Verified - Task status in DB: ${recoveryTask.status}`);
      }
    }
  } catch (taskError) {
    console.error(`❌ ERROR: ${taskError.message}`);
    console.error(taskError.stack);
  }

  // Notifications...
  try {
    await notificationService.sendNotification(
      loan.customerId,
      `✅ Payment of €${amount.toLocaleString()} received for Loan #${loanId} (EMI #${emiNumber}). Thank you!`,
      'payment_received',
      {
        loanId: loanId,
        paymentAmount: amount,
        paymentDate: payment.paymentDate,
        paymentId: payment.id,
        emiNumber: emiNumber,
        loanAmount: loan.amount
      }
    );

    const admins = await User.findAll({ where: { role: 'admin' } });
    for (const admin of admins) {
      await notificationService.sendNotification(
        admin.id,
        `💰 Payment of €${amount.toLocaleString()} received for Loan #${loanId} (EMI #${emiNumber}) from ${loan.Customer?.name}.`,
        'payment_received_admin',
        {
          loanId: loanId,
          paymentAmount: amount,
          customerName: loan.Customer?.name,
          customerEmail: loan.Customer?.email,
          paymentId: payment.id,
          emiNumber: emiNumber,
          paymentDate: payment.paymentDate
        }
      );
    }
  } catch (notifError) {
    console.error(`❌ Notification error: ${notifError.message}`);
  }

  res.status(201).json({
    success: true,
    message: 'Payment created successfully',
    data: payment
  });
});


// Get payments by loan
exports.getPaymentsByLoan = asyncHandler(async (req, res) => {
  const { loanId } = req.params;
  const payments = await Payment.findAll({
    where: { loanId },
    order: [['createdAt', 'DESC']]
  });

  res.json({
    success: true,
    count: payments.length,
    data: payments
  });
});
