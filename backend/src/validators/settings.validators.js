const { body, param } = require('express-validator');

const createRules = [
  body('key').trim().notEmpty().matches(/^[a-z0-9_]+$/).withMessage('key must be lowercase letters, numbers, underscores'),
  body('value_fr').optional().trim(),
  body('value_ar').optional().trim(),
  body('description').optional().trim(),
];

const updateRules = [
  body('value_fr').optional().trim(),
  body('value_ar').optional().trim(),
  body('description').optional().trim(),
];

const keyParam = [param('key').trim().notEmpty().withMessage('Setting key is required')];

module.exports = { createRules, updateRules, keyParam };
