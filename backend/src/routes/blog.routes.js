const router = require('express').Router();
const ctrl = require('../controllers/blog.controller');
const { authenticate, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createRules, updateRules, idParam } = require('../validators/blog.validators');

router.use(authenticate);

router.get('/', ctrl.list);
router.get('/:id', idParam, validate, ctrl.getById);
router.post('/', requireRole('ADMIN', 'STAFF'), createRules, validate, ctrl.create);
router.put('/:id', requireRole('ADMIN', 'STAFF'), [...idParam, ...updateRules], validate, ctrl.update);
router.patch('/:id/publish', requireRole('ADMIN', 'STAFF'), idParam, validate, ctrl.togglePublish);
router.delete('/:id', requireRole('ADMIN'), idParam, validate, ctrl.remove);

module.exports = router;
