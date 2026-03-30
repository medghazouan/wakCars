const { body, param } = require('express-validator');

const createRules = [
  body('car_id').isInt({ min: 1 }).withMessage('Valid car_id required'),
  body('provider').trim().notEmpty().withMessage('provider is required'),
  body('policy_number').trim().notEmpty().withMessage('policy_number is required'),
  body('start_date').isISO8601().withMessage('Valid start_date required'),
  body('expiry_date')
    .isISO8601()
    .withMessage('Valid expiry_date required')
    .custom((val, { req }) => {
      if (new Date(val) <= new Date(req.body.start_date)) {
        throw new Error('expiry_date must be after start_date');
      }
      return true;
    }),
  body('notes').optional().trim(),
];

const updateRules = createRules.map((r) => r.optional());
const idParam = [param('id').isInt({ min: 1 }).withMessage('Valid insurance id required')];

module.exports = { createRules, updateRules, idParam };
