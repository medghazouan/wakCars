const router = require('express').Router();
const ctrl = require('../controllers/search.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.search);

module.exports = router;
