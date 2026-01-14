// LOCATION: backend/src/services/CovenantCheckService.js

const { Covenant, CovenantAudit, RecoveryTask, Loan, Payment, ESGMetric, Customer } = require('../models');
const { notificationService } = require('./NotificationService');
const { Op } = require('sequelize');

class CovenantCheckService {
  async checkAllCovenants() {
    try {
      const covenants = await Covenant.findAll({
        where: { status: 'ACTIVE' },
        include: {
          model: Loan,
          include: [Customer, ESGMetric, Payment]
        }
      });

      console.log(`\n🔍 Checking ${covenants.length} active covenants...`);

      // ✅ ADDED: Filter out covenants for recovered/closed loans
      const activeCovenants = covenants.filter(covenant => {
        const loan = covenant.Loan;
        if (!loan) return false;
        
        // Skip if loan is recovered or closed
        if (loan.recoveryStatus === 'recovered' || 
            loan.status === 'recovered' || 
            loan.status === 'closed') {
          console.log(`   ⏭️  Skipping Covenant #${covenant.id} - Loan #${loan.id} is ${loan.recoveryStatus || loan.status}`);
          return false;
        }
        
        return true;
      });

      console.log(`✅ Active covenants to check: ${activeCovenants.length}\n`);

      for (const covenant of activeCovenants) { // ✅ CHANGED: Use filtered list
        const result = await this.evaluateCovenant(covenant);

        // ✅✅✅ AUTO-CREATE RECOVERY TASK ON BREACH ✅✅✅
        if (result.status === 'BREACHED') {
          try {
            // Check if task already exists for this breach
            const existingTask = await RecoveryTask.findOne({
              where: {
                loanId: covenant.loanId,
                taskType: 'COVENANT_BREACH',
                status: { [Op.ne]: 'COMPLETED' }
              }
            });

            if (!existingTask) {
              const aiSuggestions = {
                summary: `Covenant "${covenant.name}" breached on Loan #${covenant.loanId}`,
                steps: [
                  `Review ${covenant.type} metrics immediately`,
                  'Contact customer to discuss covenant breach',
                  'Assess remediation options',
                  'Consider margin adjustment or restructuring'
                ],
                urgency: covenant.severity,
                covenantType: covenant.type
              };

              await RecoveryTask.create({
                loanId: covenant.loanId,
                title: `Covenant Breach: ${covenant.name}`,
                description: `${covenant.description}. Current value: ${result.actualValue}. Threshold: ${covenant.threshold}`,
                priority: covenant.severity === 'CRITICAL' ? 'URGENT' : 'HIGH',
                taskType: 'COVENANT_BREACH',
                status: 'PENDING',
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
                assignedTo: null,
                aiSuggestions: JSON.stringify(aiSuggestions)
              });

              console.log(`✅ Recovery Task Created for Covenant Breach - Loan #${covenant.loanId}`);
            }
          } catch (taskError) {
            console.error(`❌ Failed to create recovery task for breach:`, taskError.message);
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Covenant check failed:', error);
      throw error;
    }
  }

  async checkSingleCovenant(covenant) {
    try {
      const loan = covenant.Loan;
      let checkedValue = 0;

      if (!loan) return;

      switch (covenant.type) {
        case 'PAYMENT_DELAY':
          checkedValue = await this.calculatePaymentDelay(loan);
          break;
        case 'DSCR':
          checkedValue = await this.calculateDSCR(loan);
          break;
        case 'LEVERAGE':
          checkedValue = await this.calculateLeverage(loan);
          break;
        case 'ESG_SCORE':
          checkedValue = await this.getESGScore(loan);
          break;
        default:
          checkedValue = 0;
      }

      const breached = this.evaluateCovenant(checkedValue, covenant.threshold, covenant.operator);

      await CovenantAudit.create({
        covenantId: covenant.id,
        checkDate: new Date(),
        checkedValue,
        threshold: covenant.threshold,
        status: breached ? 'BREACHED' : 'PASSED',
        breachDetails: breached
          ? `Value ${checkedValue} breached threshold ${covenant.threshold}`
          : null
      });

      if (breached && covenant.status !== 'BREACHED') {
        await covenant.update({
          status: 'BREACHED',
          breachDate: new Date(),
          breachValue: checkedValue
        });

        await this.createRecoveryTaskForBreach(covenant, loan, checkedValue);
        await this.notifyBreach(covenant, loan, checkedValue);
      }

      covenant.lastChecked = new Date();
      await covenant.save();
    } catch (err) {
      console.error(`❌ Error checking covenant ${covenant.id}:`, err);
      await CovenantAudit.create({
        covenantId: covenant.id,
        checkDate: new Date(),
        checkedValue: null,
        threshold: covenant.threshold,
        status: 'ERROR',
        breachDetails: err.message
      });
    }
  }

  evaluateCovenant(value, threshold, operator) {
    switch (operator) {
      case 'GREATER_THAN':
        return value < threshold;
      case 'LESS_THAN':
        return value > threshold;
      case 'EQUALS':
        return value !== threshold;
      case 'NOT_EQUALS':
        return value === threshold;
      default:
        return false;
    }
  }

  async calculatePaymentDelay(loan) {
    const now = new Date();
    const startDate = new Date(loan.startDate);
    const msPerMonth = 30 * 24 * 60 * 60 * 1000;
    const monthsSinceStart = Math.floor((now - startDate) / msPerMonth);
    const expectedPayments = Math.min(monthsSinceStart, loan.termMonths || monthsSinceStart);
    const completedPayments =
      loan.Payments?.filter((p) => p.status === 'completed').length || 0;
    return Math.max(0, expectedPayments - completedPayments);
  }

  async calculateDSCR(loan) {
    // placeholder: return healthy DSCR
    return 1.5;
  }

  async calculateLeverage(loan) {
    // placeholder: typical leverage value
    return 3.0;
  }

  async getESGScore(loan) {
    const metric = await ESGMetric.findOne({ where: { loanId: loan.id } });
    return metric?.esgScore || 0;
  }

  async createRecoveryTaskForBreach(covenant, loan, breachValue) {
    await RecoveryTask.create({
      loanId: loan.id,
      title: `Covenant Breach: ${covenant.name}`,
      description: `${covenant.type} covenant breached. Current value: ${breachValue}, Threshold: ${covenant.threshold}`,
      priority:
        covenant.severity === 'CRITICAL'
          ? 'URGENT'
          : covenant.severity === 'HIGH'
            ? 'HIGH'
            : 'MEDIUM',
      taskType: 'COVENANT_BREACH',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      assignedTo: loan.agentId || null
    });
  }

  async notifyBreach(covenant, loan, breachValue) {
    if (!loan.agentId) return;
    await notificationService.sendNotification(
      loan.agentId,
      `⚠️ Covenant Breach Alert: ${covenant.name} for Loan #${loan.id}. Current: ${breachValue}, Threshold: ${covenant.threshold}`,
      'covenant_breach',
      { loanId: loan.id, covenantId: covenant.id, breachValue }
    );
  }

  // ✅✅✅ NEW: AUTO-COMPLETE COVENANTS WHEN LOAN RECOVERED ✅✅✅
  async autoCompleteCovenantsByLoan(loanId) {
    try {
      console.log(`\n✅ AUTO-COMPLETING COVENANTS FOR RECOVERED LOAN #${loanId}`);
      
      // Find all active covenants for this loan
      const activeCovenants = await Covenant.findAll({
        where: {
          loanId: loanId,
          status: { [Op.in]: ['ACTIVE', 'BREACHED'] }
        }
      });
      
      if (activeCovenants.length === 0) {
        console.log(`   ℹ️  No active covenants found for Loan #${loanId}`);
        return;
      }
      
      // Update all to INACTIVE
      await Covenant.update(
        {
          status: 'INACTIVE',
          lastChecked: new Date()
        },
        {
          where: {
            loanId: loanId,
            status: { [Op.in]: ['ACTIVE', 'BREACHED'] }
          }
        }
      );
      
      console.log(`✅ Marked ${activeCovenants.length} covenant(s) as INACTIVE for Loan #${loanId}`);
      activeCovenants.forEach(covenant => {
        console.log(`   • ${covenant.name} (ID: ${covenant.id})`);
      });
      
    } catch (error) {
      console.error(`❌ Error auto-completing covenants:`, error.message);
    }
  }
}

const covenantCheckService = new CovenantCheckService();
module.exports = { covenantCheckService };
