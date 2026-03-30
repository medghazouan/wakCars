const { body, param } = require('express-validator');

const METHODS = ['CASH', 'BANK_TRANSFER', 'CARD'];

const createRules = [
  body('reservation_id').isInt({ min: 1 }).withMessage('Valid reservation_id required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('amount must be a positive number'),
  body('method').isIn(METHODS).withMessage(`method must be one of: ${METHODS.join(', ')}`),
  body('reference').optional().trim(),
  body('notes').optional().trim(),
];

const updateRules = createRules.map((r) => r.optional());

const idParam = [param('id').isInt({ min: 1 }).withMessage('Valid payment id required')];

module.exports = { createRules, updateRules, idParam };
