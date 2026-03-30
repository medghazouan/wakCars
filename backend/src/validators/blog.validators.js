const { body, param } = require('express-validator');

const createRules = [
  body('title_fr').trim().notEmpty().withMessage('title_fr is required'),
  body('title_ar').trim().notEmpty().withMessage('title_ar is required'),
  body('slug_fr').trim().notEmpty().matches(/^[a-z0-9-]+$/).withMessage('slug_fr must be lowercase, numbers, hyphens'),
  body('slug_ar').trim().notEmpty().withMessage('slug_ar is required'),
  body('content_fr').trim().notEmpty().withMessage('content_fr is required'),
  body('content_ar').trim().notEmpty().withMessage('content_ar is required'),
  body('excerpt_fr').optional().trim(),
  body('excerpt_ar').optional().trim(),
  body('cover_image').optional().trim(),
  body('category').optional().trim(),
  body('tags').optional().trim(),
  body('is_published').optional().isBoolean(),
  body('is_featured').optional().isBoolean(),
  body('meta_title_fr').optional().trim().isLength({ max: 70 }).withMessage('meta_title_fr max 70 chars'),
  body('meta_title_ar').optional().trim().isLength({ max: 70 }).withMessage('meta_title_ar max 70 chars'),
  body('meta_desc_fr').optional().trim().isLength({ max: 165 }).withMessage('meta_desc_fr max 165 chars'),
  body('meta_desc_ar').optional().trim().isLength({ max: 165 }).withMessage('meta_desc_ar max 165 chars'),
];

const updateRules = createRules.map((r) => r.optional());
const idParam = [param('id').isInt({ min: 1 }).withMessage('Valid post id required')];

module.exports = { createRules, updateRules, idParam };
