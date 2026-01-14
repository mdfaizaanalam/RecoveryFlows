// LOCATION: backend/src/routes/esg.js

const express = require('express');
const router = express.Router();
const esgController = require('../controllers/esgController');
const auth = require('../middleware/auth');

router.post('/', auth(['admin']), esgController.createESGMetric);
router.get('/', auth(), esgController.getESGMetrics);
router.put('/:id', auth(['admin']), esgController.updateESGMetric);
router.get('/dashboard', auth(), esgController.getESGDashboard);

// ✅✅✅ ADD THIS NEW ROUTE ✅✅✅
router.post('/recalculate-carbon', auth(['admin']), esgController.recalculateCarbonKPIs);

module.exports = router;
