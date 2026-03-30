const router = require('express').Router();
const { revenue, utilization, reservationAnalytics, exportReport } = require('../controllers/reports.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/revenue', revenue);
router.get('/utilization', utilization);
router.get('/reservations', reservationAnalytics);
router.get('/export', exportReport);

module.exports = router;
