const { body, param } = require('express-validator');

const createRules = [
  body('car_id').isInt({ min: 1 }).withMessage('Valid car_id required'),
  body('visit_date').isISO8601().withMessage('Valid visit_date required'),
  body('expiration_date').optional().isISO8601().withMessage('Valid expiration_date'),
  body('cost').optional().isFloat({ min: 0 }).withMessage('cost must be a positive number'),
];

const updateRules = createRules.map((r) => r.optional());
const idParam = [param('id').isInt({ min: 1 }).withMessage('Valid technical visit id required')];

module.exports = { createRules, updateRules, idParam };
