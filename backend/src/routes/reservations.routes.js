const router = require('express').Router();
const ctrl = require('../controllers/reservations.controller');
const { authenticate, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createRules, updateRules, statusRules, reassignRules, idParam } = require('../validators/reservations.validators');

router.use(authenticate);

router.get('/', ctrl.list);
router.get('/:id', idParam, validate, ctrl.getById);
router.post('/', requireRole('ADMIN', 'STAFF'), createRules, validate, ctrl.create);
router.put('/:id', requireRole('ADMIN', 'STAFF'), [...idParam, ...updateRules], validate, ctrl.update);
router.patch('/:id/status', requireRole('ADMIN', 'STAFF'), statusRules, validate, ctrl.updateStatus);
router.patch('/:id/reassign', requireRole('ADMIN', 'STAFF'), reassignRules, validate, ctrl.reassign);
router.patch('/:id/confirm', requireRole('ADMIN', 'STAFF'), idParam, validate, ctrl.confirm);

module.exports = router;
