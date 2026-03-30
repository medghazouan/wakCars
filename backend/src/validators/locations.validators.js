const { body, param } = require('express-validator');

const createRules = [
  body('name_fr').trim().notEmpty().withMessage('name_fr is required'),
  body('name_ar').trim().notEmpty().withMessage('name_ar is required'),
  body('slug')
    .trim()
    .notEmpty()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('slug must be lowercase letters, numbers, and hyphens'),
  body('address_fr').trim().notEmpty().withMessage('address_fr is required'),
  body('address_ar').trim().notEmpty().withMessage('address_ar is required'),
  body('city').optional().trim(),
];

const updateRules = createRules.map((r) => r.optional());

const idParam = [param('id').isInt({ min: 1 }).withMessage('Valid location id required')];

module.exports = { createRules, updateRules, idParam };
