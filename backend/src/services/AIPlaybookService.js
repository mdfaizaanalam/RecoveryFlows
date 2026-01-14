// LOCATION: backend/src/services/AIPlaybookService.js

class AIPlaybookService {
  getPlaybook(taskType) {
    const playbooks = {
      REMINDER: {
        label: 'Soft Reminder',
        steps: [
          'Send friendly SMS reminder',
          'Follow-up email after 3 days if unpaid',
          'Phone call if no response after 7 days'
        ],
        callScript:
          'Hello {customer_name}, this is a friendly reminder about your upcoming EMI of {currency}{emi_amount} due on {due_date}. We are here to help if you need any support.',
        timeline: '7–10 days'
      },
      RESTRUCTURE: {
        label: 'Restructure Proposal',
        steps: [
          'Assess customer financial situation and affordability',
          'Prepare restructuring options (tenor extension, step-up EMI, partial waiver)',
          'Discuss and agree revised terms with customer',
          'Sign addendum and update schedule'
        ],
        callScript:
          'We understand you may be facing financial challenges. We can explore restructuring options to keep your loan on track. When would be a good time to discuss possible solutions?',
        timeline: '14–21 days'
      },
      LEGAL: {
        label: 'Legal Escalation',
        steps: [
          'Send formal legal notice with clear timelines',
          'Engage legal counsel and prepare documentation',
          'File recovery case within internal SLA',
          'Pursue asset recovery in line with policy'
        ],
        callScript:
          'This is a formal notice regarding overdue payments on your loan. If we do not receive payment within the specified time, we may initiate legal recovery proceedings.',
        timeline: '30–60 days'
      },
      COVENANT_BREACH: {
        label: 'Covenant Breach Handling',
        steps: [
          'Review breach type, severity, and history',
          'Contact borrower and explain breach implications',
          'Request remediation plan and timelines',
          'Escalate internally if no response within 48 hours'
        ],
        callScript:
          'We have detected a covenant breach on your loan facility. We would like to discuss remediation actions and next steps as soon as possible.',
        timeline: '2–5 days'
      }
    };

    return playbooks[taskType] || playbooks.REMINDER;
  }

  generatePaymentPlan(loanAmount, missedPayments, monthlyIncome) {
    const safeInstallment = monthlyIncome ? monthlyIncome * 0.3 : loanAmount * 0.05;
    const proposedMonthlyPayment = Math.min(loanAmount * 0.1, safeInstallment);
    const term = Math.ceil(loanAmount / proposedMonthlyPayment);

    return {
      proposedMonthlyPayment: Number(proposedMonthlyPayment.toFixed(2)),
      termInMonths: term,
      totalRecovered: Number((proposedMonthlyPayment * term).toFixed(2)),
      missedPayments,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
    };
  }
}

const aiPlaybookService = new AIPlaybookService();
module.exports = { aiPlaybookService };
