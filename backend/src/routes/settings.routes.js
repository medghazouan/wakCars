const router = require('express').Router();
const { list, getByKey, updateByKey, create } = require('../controllers/settings.controller');
const { authenticate, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createRules, updateRules, keyParam } = require('../validators/settings.validators');

router.use(authenticate);

router.get('/', list);
router.get('/:key', keyParam, validate, getByKey);
router.put('/:key', requireRole('ADMIN'), [...keyParam, ...updateRules], validate, updateByKey);
router.post('/', requireRole('ADMIN'), createRules, validate, create);

module.exports = router;
