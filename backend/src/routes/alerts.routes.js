const router = require('express').Router();
const { getAlerts } = require('../controllers/alerts.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getAlerts);

module.exports = router;
