const router = require('express').Router();
const { list, getById, create, update } = require('../controllers/customers.controller');
const { authenticate, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createRules, updateRules, idParam } = require('../validators/customers.validators');

router.use(authenticate);

router.get('/', list);
router.get('/:id', idParam, validate, getById);
router.post('/', requireRole('ADMIN', 'STAFF'), createRules, validate, create);
router.put('/:id', requireRole('ADMIN', 'STAFF'), [...idParam, ...updateRules], validate, update);

module.exports = router;
