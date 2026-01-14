// LOCATION: backend/src/routes/covenant.js

const express = require('express');
const router = express.Router();
const covenantController = require('../controllers/covenantController');
const auth = require('../middleware/auth');

// ✅ CREATE: Admin only
router.post('/', auth(['admin']), covenantController.createCovenant);

// ✅ GET ALL: Admin & Agent (for dashboard metrics)
router.get('/', auth(['admin', 'agent']), covenantController.getCovenants);

// ✅ UPDATE: Admin only
router.put('/:id', auth(['admin']), covenantController.updateCovenant);

// ✅ AUDIT TRAIL: All authenticated users
router.get('/:covenantId/audit', auth(), covenantController.getCovenantAuditTrail);

module.exports = router;
