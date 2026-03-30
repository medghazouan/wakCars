const { body, param } = require('express-validator');

const createRules = [
  body('car_id').isInt({ min: 1 }).withMessage('Valid car_id required'),
  body('description').trim().notEmpty().withMessage('description is required'),
  body('reservation_id').optional().isInt({ min: 1 }),
  body('estimated_cost').optional().isFloat({ min: 0 }).withMessage('estimated_cost must be positive'),
  body('customer_notified').optional().isBoolean(),
];

const updateRules = [
  param('id').isInt({ min: 1 }),
  body('description').optional().trim(),
  body('estimated_cost').optional().isFloat({ min: 0 }),
  body('resolved').optional().isBoolean(),
  body('customer_notified').optional().isBoolean(),
];

const idParam = [param('id').isInt({ min: 1 }).withMessage('Valid damage report id required')];

const imageIdParam = [
  param('id').isInt({ min: 1 }),
  param('imageId').isInt({ min: 1 }).withMessage('Valid image id required'),
];

module.exports = { createRules, updateRules, idParam, imageIdParam };
