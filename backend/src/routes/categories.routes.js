const router = require('express').Router();
const { list, getById, create, update, deactivate } = require('../controllers/categories.controller');
const { authenticate, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createRules, updateRules, idParam } = require('../validators/categories.validators');

router.use(authenticate);

router.get('/', list);
router.get('/:id', idParam, validate, getById);
router.post('/', requireRole('ADMIN', 'STAFF'), createRules, validate, create);
router.put('/:id', requireRole('ADMIN', 'STAFF'), updateRules, validate, update);
router.delete('/:id', requireRole('ADMIN'), idParam, validate, deactivate);

module.exports = router;
