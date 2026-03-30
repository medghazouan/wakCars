const { body, param } = require('express-validator');

const FAQ_CATEGORIES = ['Documents', 'Assurance', 'Prise en Charge', 'Maroc', 'Tarifs'];

const createRules = [
  body('question_fr').trim().notEmpty().withMessage('question_fr is required'),
  body('question_ar').trim().notEmpty().withMessage('question_ar is required'),
  body('answer_fr').trim().notEmpty().withMessage('answer_fr is required'),
  body('answer_ar').trim().notEmpty().withMessage('answer_ar is required'),
  body('category')
    .trim()
    .notEmpty()
    .isIn(FAQ_CATEGORIES)
    .withMessage(`category must be one of: ${FAQ_CATEGORIES.join(', ')}`),
  body('sort_order').optional().isInt({ min: 0 }),
  body('is_published').optional().isBoolean(),
];

const updateRules = createRules.map((r) => r.optional());
const idParam = [param('id').isInt({ min: 1 }).withMessage('Valid FAQ id required')];

module.exports = { createRules, updateRules, idParam };
