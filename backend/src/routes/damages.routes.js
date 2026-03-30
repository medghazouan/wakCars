const router = require('express').Router();
const ctrl = require('../controllers/damages.controller');
const { authenticate, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { createRules, updateRules, idParam, imageIdParam } = require('../validators/damages.validators');

router.use(authenticate);

router.get('/', ctrl.list);
router.get('/:id', idParam, validate, ctrl.getById);
router.post('/', requireRole('ADMIN', 'STAFF'), upload.array('images', 10), createRules, validate, ctrl.create);
router.put('/:id', requireRole('ADMIN', 'STAFF'), updateRules, validate, ctrl.update);
router.post('/:id/images', requireRole('ADMIN', 'STAFF'), upload.single('image'), idParam, validate, ctrl.addImage);
router.delete('/:id/images/:imageId', requireRole('ADMIN', 'STAFF'), imageIdParam, validate, ctrl.deleteImage);
router.patch('/:id/notify', requireRole('ADMIN', 'STAFF'), idParam, validate, ctrl.notifyCustomer);

module.exports = router;
