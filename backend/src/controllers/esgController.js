// LOCATION: backend/src/controllers/esgController.js

const { ESGMetric, Loan } = require('../models');
const { asyncHandler, NotFoundError, AuthorizationError } = require('../utils/errorHandler');

function deriveKPIStatus(kpiCurrent, kpiTarget) {
  if (!kpiTarget || kpiTarget === 0) return 'ON_TRACK';
  if (kpiCurrent >= kpiTarget) return 'ON_TRACK';
  if (kpiCurrent >= kpiTarget * 0.9) return 'AT_RISK';
  return 'BREACHED';
}

exports.createESGMetric = asyncHandler(async (req, res) => {
  const {
    loanId,
    esgScore,
    carbonIntensity,
    sustainabilityKPI,
    kpiTarget,
    kpiCurrent,
    greenLoanClassification,
    marginAdjustment
  } = req.body;

  if (req.user.role !== 'admin') {
    throw new AuthorizationError('Only admins can create ESG metrics');
  }

  const loan = await Loan.findByPk(loanId);
  if (!loan) throw new NotFoundError('Loan not found');

  const kpiStatus = deriveKPIStatus(kpiCurrent, kpiTarget);

  const metric = await ESGMetric.create({
    loanId,
    esgScore,
    carbonIntensity,
    sustainabilityKPI,
    kpiTarget,
    kpiCurrent,
    kpiStatus,
    greenLoanClassification,
    marginAdjustment: marginAdjustment || 0,
    lastReportDate: new Date()
  });

  res.status(201).json({
    success: true,
    message: 'ESG metric created successfully',
    data: metric
  });
});

exports.getESGMetrics = asyncHandler(async (req, res) => {
  const { kpiStatus, greenLoanClassification } = req.query;
  const where = {};

  if (kpiStatus) where.kpiStatus = kpiStatus;
  if (greenLoanClassification !== undefined)
    where.greenLoanClassification = greenLoanClassification === 'true';

  const metrics = await ESGMetric.findAll({
    where,
    include: [
      {
        model: Loan,
        attributes: ['id', 'amount', 'status', 'customerId', 'recoveryStatus'], // ✅ ADDED recoveryStatus
        required: true
      }
    ],
    order: [
      ['kpiStatus', 'DESC'],
      ['createdAt', 'DESC']
    ]
  });

  res.json({
    success: true,
    count: metrics.length,
    data: metrics
  });
});

exports.updateESGMetric = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (req.user.role !== 'admin') {
    throw new AuthorizationError('Only admins can update ESG metrics');
  }

  const metric = await ESGMetric.findByPk(id);
  if (!metric) throw new NotFoundError('ESG metric not found');

  if (updates.kpiCurrent !== undefined || updates.kpiTarget !== undefined) {
    const newCurrent = updates.kpiCurrent ?? metric.kpiCurrent;
    const newTarget = updates.kpiTarget ?? metric.kpiTarget;
    updates.kpiStatus = deriveKPIStatus(newCurrent, newTarget);
  }

  await metric.update(updates);

  res.json({
    success: true,
    message: 'ESG metric updated successfully',
    data: metric
  });
});

exports.getESGDashboard = asyncHandler(async (req, res) => {
  const metrics = await ESGMetric.findAll({
    include: [
      {
        model: Loan,
        attributes: ['id', 'amount', 'status', 'recoveryStatus'], // ✅ ADDED recoveryStatus
        required: true
      }
    ]
  });

  const totalLoans = metrics.length || 0;
  const greenLoans = metrics.filter((m) => m.greenLoanClassification).length;
  const onTrack = metrics.filter((m) => m.kpiStatus === 'ON_TRACK').length;
  const atRisk = metrics.filter((m) => m.kpiStatus === 'AT_RISK').length;
  const breached = metrics.filter((m) => m.kpiStatus === 'BREACHED').length;
  const avgESGScore =
    totalLoans > 0
      ? metrics.reduce((sum, m) => sum + (m.esgScore || 0), 0) / totalLoans
      : 0;

  res.json({
    success: true,
    summary: {
      totalLoans,
      greenLoans,
      onTrack,
      atRisk,
      breached,
      avgESGScore: Number(avgESGScore.toFixed(2))
    },
    data: metrics
  });
});

// ✅✅✅ ADD THIS NEW FUNCTION BELOW ✅✅✅
exports.recalculateCarbonKPIs = asyncHandler(async (req, res) => {
  console.log('\n🔄 RECALCULATING CARBON REDUCTION KPIs...\n');

  try {
    // Get all green loans with Carbon Reduction Target KPI
    const greenESGMetrics = await ESGMetric.findAll({
      where: {
        greenLoanClassification: true,
        sustainabilityKPI: 'Carbon Reduction Target'
      },
      include: {
        model: Loan,
        attributes: ['id', 'recoveryStatus', 'status']
      }
    });

    console.log(`📊 Found ${greenESGMetrics.length} green loan(s) with Carbon Reduction Target\n`);

    let updatedCount = 0;

    for (const metric of greenESGMetrics) {
      const loan = metric.Loan;
      
      // Check if loan is recovered
      const isRecovered = loan && (
        loan.recoveryStatus === 'recovered' || 
        loan.status === 'closed' ||
        loan.status === 'recovered'
      );

      // Current stored value
      const currentKPI = metric.kpiCurrent || 0;

      // Expected value (1 if recovered, 0 if not)
      const expectedKPI = isRecovered ? 1 : 0;

      if (currentKPI !== expectedKPI) {
        await metric.update({ kpiCurrent: expectedKPI });
        
        console.log(`✅ UPDATED - Loan #${loan.id}`);
        console.log(`   Old KPI: ${currentKPI}/20`);
        console.log(`   New KPI: ${expectedKPI}/20`);
        console.log(`   Status: ${loan.recoveryStatus || loan.status}`);
        console.log(`   Recovered: ${isRecovered ? 'YES ✓' : 'NO ✗'}\n`);
        
        updatedCount++;
      } else {
        console.log(`✓ Already Correct - Loan #${loan.id} - ${expectedKPI}/20\n`);
      }
    }

    console.log(`${'='.repeat(60)}`);
    console.log(`✅ RECALCULATION COMPLETE`);
    console.log(`   Total Green Loans: ${greenESGMetrics.length}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Already Correct: ${greenESGMetrics.length - updatedCount}`);
    console.log(`${'='.repeat(60)}\n`);

    res.json({
      success: true,
      message: `Recalculated carbon KPIs for ${greenESGMetrics.length} green loans`,
      data: {
        totalGreenLoans: greenESGMetrics.length,
        updated: updatedCount,
        alreadyCorrect: greenESGMetrics.length - updatedCount
      }
    });
  } catch (error) {
    console.error('❌ Recalculation failed:', error);
    throw error;
  }
});
