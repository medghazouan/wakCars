const router = require('express').Router();
const { getStats } = require('../controllers/dashboard.controller');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('ADMIN'));
router.get('/', getStats);

module.exports = router;
