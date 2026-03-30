const { body, param } = require('express-validator');

const createRules = [
  body('name_fr').trim().notEmpty().withMessage('name_fr is required'),
  body('name_ar').trim().notEmpty().withMessage('name_ar is required'),
  body('slug')
    .trim()
    .notEmpty()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('slug must be lowercase letters, numbers, and hyphens only'),
  body('desc_fr').optional().trim(),
  body('desc_ar').optional().trim(),
  body('sort_order').optional().isInt({ min: 0 }).withMessage('sort_order must be a non-negative integer'),
];

const updateRules = [
  ...createRules.map((r) => r.optional()),
  param('id').isInt({ min: 1 }).withMessage('Valid category id required'),
];

const idParam = [param('id').isInt({ min: 1 }).withMessage('Valid category id required')];

module.exports = { createRules, updateRules, idParam };
