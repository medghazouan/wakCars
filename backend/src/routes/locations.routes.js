const router = require('express').Router();
const {
  list,
  getById,
  create,
  update,
  remove,
  addImage,
  removeImage,
} = require('../controllers/locations.controller');
const { authenticate, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const {
  createRules,
  updateRules,
  idParam,
  removeImageRules,
} = require('../validators/locations.validators');

router.use(authenticate);

router.get('/', list);
router.get('/:id', idParam, validate, getById);
router.post('/', requireRole('ADMIN', 'STAFF'), createRules, validate, create);
router.put('/:id', requireRole('ADMIN', 'STAFF'), updateRules, validate, update);
router.post(
  '/:id/images/remove',
  requireRole('ADMIN', 'STAFF'),
  removeImageRules,
  validate,
  removeImage
);
router.post(
  '/:id/images',
  requireRole('ADMIN', 'STAFF'),
  upload.single('image'),
  idParam,
  validate,
  addImage
);
router.delete('/:id', requireRole('ADMIN'), idParam, validate, remove);

module.exports = router;
