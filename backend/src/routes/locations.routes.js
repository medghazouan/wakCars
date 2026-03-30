const router = require('express').Router();
const { list, getById, create, update, remove } = require('../controllers/locations.controller');
const { authenticate, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createRules, updateRules, idParam } = require('../validators/locations.validators');

router.use(authenticate);

router.get('/', list);
router.get('/:id', idParam, validate, getById);
router.post('/', requireRole('ADMIN', 'STAFF'), createRules, validate, create);
router.put('/:id', requireRole('ADMIN', 'STAFF'), updateRules, validate, update);
router.delete('/:id', requireRole('ADMIN'), idParam, validate, remove);

module.exports = router;
