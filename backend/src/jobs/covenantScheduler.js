// LOCATION: backend/src/jobs/covenantScheduler.js

const cron = require('node-cron');
const { covenantCheckService } = require('../services/CovenantCheckService');

// ✅ ADD THIS FLAG TO PREVENT DOUBLE INITIALIZATION
let isSchedulerRunning = false;

function startCovenantScheduler() {
  // ✅ CHECK IF ALREADY RUNNING
  if (isSchedulerRunning) {
    console.log('ℹ️  Covenant scheduler already running, skipping...');
    return;
  }

  // Run every day at 02:00 server time
  cron.schedule('0 2 * * *', async () => {
    console.log('📅 Running scheduled covenant checks (02:00)...');
    try {
      await covenantCheckService.checkAllCovenants();
    } catch (err) {
      console.error('❌ Covenant scheduler error:', err);
    }
  });

  // ✅ SET FLAG AND LOG ONLY ONCE
  isSchedulerRunning = true;
  console.log('✅ Covenant scheduler registered (daily 02:00)');
}

module.exports = { startCovenantScheduler };
