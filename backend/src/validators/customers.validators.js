const { body, param, query } = require('express-validator');

const createRules = [
  body('first_name').trim().notEmpty().withMessage('first_name is required'),
  body('last_name').trim().notEmpty().withMessage('last_name is required'),
  body('phone')
    .trim()
    .notEmpty()
    .matches(/^\+?[0-9\s\-]{8,20}$/)
    .withMessage('Valid phone number required (WhatsApp key)'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('nationality').optional().trim(),
  body('licence_country').optional().trim(),
  body('licence_number').optional().trim(),
  body('passport_number').optional().trim(),
  body('notes').optional().trim(),
];

const updateRules = createRules.map((r) => r.optional());

const idParam = [param('id').isInt({ min: 1 }).withMessage('Valid customer id required')];

module.exports = { createRules, updateRules, idParam };
