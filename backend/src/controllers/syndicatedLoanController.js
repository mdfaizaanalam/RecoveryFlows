// LOCATION: backend/src/controllers/syndicatedLoanController.js

const { LoanParticipant, Loan, Payment } = require('../models');

const {
  asyncHandler,
  NotFoundError,
  AuthorizationError
} = require('../utils/errorHandler');

exports.addParticipant = asyncHandler(async (req, res) => {
  const { loanId, lenderName, participationPercentage, contactEmail } = req.body;

  if (req.user.role !== 'admin') {
    throw new AuthorizationError('Only admins can add loan participants');
  }

  const loan = await Loan.findByPk(loanId);
  if (!loan) {
    throw new NotFoundError('Loan not found');
  }

  const participationAmount = (Number(loan.amount) * Number(participationPercentage || 0)) / 100;

  const participant = await LoanParticipant.create({
    loanId,
    lenderName,
    participationPercentage,
    participationAmount,
    role: 'participant',
    contactEmail,
    outstandingAmount: participationAmount
  });

  res.status(201).json({
    success: true,
    message: 'Participant added successfully',
    data: participant
  });
});

exports.getParticipantsByLoan = asyncHandler(async (req, res) => {
  const { loanId } = req.params;

  const participants = await LoanParticipant.findAll({
    where: { loanId },
    order: [['participationPercentage', 'DESC']]
  });

  res.json({
    success: true,
    count: participants.length,
    data: participants
  });
});

// ✅✅✅ FIXED: Query only basic payment fields (no emiNumber) ✅✅✅
exports.getSyndicatedReport = asyncHandler(async (req, res) => {
  console.log('\n📊 SYNDICATED REPORT REQUEST');

  if (req.user.role !== 'admin') {
    throw new AuthorizationError('Only admins can view syndicated reports');
  }

  const loans = await Loan.findAll({
    where: {
      status: {
        [require('sequelize').Op.in]: ['approved', 'active', 'defaulted'] // ✅ Include all active loans
      }
    },
    include: [{
      model: LoanParticipant,
      required: true // ✅ Only loans that HAVE syndicated lenders
    }]
  });

  console.log(`   • Found ${loans.length} approved loans`);

  const lenderExposure = {};

  for (const loan of loans) {
    // ✅ FIXED: Only select basic fields that definitely exist
    const payments = await Payment.findAll({
      where: { loanId: loan.id },
      attributes: ['id', 'amount', 'status']
    });

    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const outstanding = Number(loan.amount || 0) - totalPaid;

    console.log(`   • Loan #${loan.id}: Participants = ${loan.LoanParticipants?.length || 0}`);

    for (const participant of loan.LoanParticipants || []) {
      const lenderName = participant.lenderName;

      if (!lenderExposure[lenderName]) {
        lenderExposure[lenderName] = {
          lenderName,
          totalExposure: 0,
          totalRecovered: 0,
          totalOutstanding: 0,
          loanCount: 0
        };
      }

      const shareAmount = Number(participant.participationAmount || 0);
      const sharePercent = Number(participant.participationPercentage || 0);

      lenderExposure[lenderName].totalExposure += shareAmount;
      lenderExposure[lenderName].totalRecovered += (totalPaid * sharePercent) / 100;
      lenderExposure[lenderName].totalOutstanding += (outstanding * sharePercent) / 100;
      lenderExposure[lenderName].loanCount += 1;
    }
  }

  const result = Object.values(lenderExposure).map(lender => ({
    lenderName: lender.lenderName,
    totalExposure: Number(lender.totalExposure.toFixed(2)),
    totalRecovered: Number(lender.totalRecovered.toFixed(2)),
    totalOutstanding: Number(lender.totalOutstanding.toFixed(2)),
    loanCount: lender.loanCount
  }));

  console.log(`   ✅ Returning ${result.length} lenders\n`);

  res.json({
    success: true,
    data: result
  });
});
