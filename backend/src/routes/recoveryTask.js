// LOCATION: backend/src/routes/recoveryTask.js

const express = require('express');
const router = express.Router();
const recoveryTaskController = require('../controllers/recoveryTaskController');
const auth = require('../middleware/auth');

router.post('/', auth(['admin', 'agent']), recoveryTaskController.createRecoveryTask);
router.get('/', auth(), recoveryTaskController.getRecoveryTasks);
router.put('/:id', auth(), recoveryTaskController.updateRecoveryTask);
router.get('/loan/:loanId', auth(), recoveryTaskController.getTasksByLoan);

module.exports = router;
