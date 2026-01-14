// LOCATION: backend/src/routes/syndicatedLoan.js

const express = require('express');
const router = express.Router();
const syndicatedLoanController = require('../controllers/syndicatedLoanController');
const auth = require('../middleware/auth');

router.post('/participants', auth(['admin']), syndicatedLoanController.addParticipant);
router.get('/participants/:loanId', auth(), syndicatedLoanController.getParticipantsByLoan);
router.get('/report', auth(['admin']), syndicatedLoanController.getSyndicatedReport); // ✅ FIXED: was /syndicated-report

module.exports = router;
