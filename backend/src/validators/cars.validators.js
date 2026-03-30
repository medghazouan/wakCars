const { body, param, query } = require('express-validator');

const CAR_STATUSES = ['AVAILABLE', 'RENTED', 'MAINTENANCE', 'INACTIVE'];
const TRANSMISSIONS = ['MANUAL', 'AUTOMATIC'];
const FUEL_TYPES = ['ESSENCE', 'DIESEL', 'HYBRID', 'ELECTRIC'];

const createRules = [
  body('brand').trim().notEmpty().withMessage('brand is required'),
  body('model').trim().notEmpty().withMessage('model is required'),
  body('slug')
    .trim()
    .notEmpty()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('slug must be lowercase letters, numbers, and hyphens'),
  body('year')
    .isInt({ min: 1990, max: new Date().getFullYear() + 1 })
    .withMessage('year must be between 1990 and next year'),
  body('license_plate').trim().notEmpty().withMessage('license_plate is required'),
  body('status').optional().isIn(CAR_STATUSES).withMessage(`status must be one of: ${CAR_STATUSES.join(', ')}`),
  body('transmission').optional().isIn(TRANSMISSIONS).withMessage('Invalid transmission'),
  body('fuel_type').optional().isIn(FUEL_TYPES).withMessage('Invalid fuel_type'),
  body('seats').optional().isInt({ min: 1, max: 20 }).withMessage('seats must be between 1 and 20'),
  body('doors').optional().isInt({ min: 2, max: 6 }).withMessage('doors must be between 2 and 6'),
  body('price_per_day').isFloat({ min: 0 }).withMessage('price_per_day must be a positive number'),
  body('deposit_amount').isFloat({ min: 0 }).withMessage('deposit_amount must be a positive number'),
  body('category_id').isInt({ min: 1 }).withMessage('Valid category_id required'),
  body('description_fr').optional().trim(),
  body('description_ar').optional().trim(),
  body('is_featured').optional().isBoolean(),
];

const updateRules = createRules.map((r) => r.optional());

const statusRules = [
  param('id').isInt({ min: 1 }).withMessage('Valid car id required'),
  body('status').isIn(CAR_STATUSES).withMessage(`status must be one of: ${CAR_STATUSES.join(', ')}`),
];

const idParam = [param('id').isInt({ min: 1 }).withMessage('Valid car id required')];

const imageIdParam = [
  param('id').isInt({ min: 1 }),
  param('imageId').isInt({ min: 1 }).withMessage('Valid image id required'),
];

module.exports = { createRules, updateRules, statusRules, idParam, imageIdParam };
