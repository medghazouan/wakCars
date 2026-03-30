const prisma = require('../utils/prisma');
const { success, created, noContent, notFound } = require('../utils/apiResponse');

const list = async (req, res, next) => {
  try {
    const { category, is_published } = req.query;
    const where = {};
    if (category) where.category = category;
    if (is_published !== undefined) where.is_published = is_published === 'true' || is_published === '1';
    const faqs = await prisma.faqs.findMany({ where, orderBy: [{ category: 'asc' }, { sort_order: 'asc' }] });
    return success(res, faqs);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const faq = await prisma.faqs.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!faq) return notFound(res, 'FAQ');
    return success(res, faq);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { question_fr, question_ar, answer_fr, answer_ar, category, sort_order = 0, is_published = true } = req.body;
    const faq = await prisma.faqs.create({
      data: { question_fr, question_ar, answer_fr, answer_ar, category, sort_order: parseInt(sort_order), is_published: Boolean(is_published) },
    });
    return created(res, faq);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await prisma.faqs.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'FAQ');

    const fields = ['question_fr', 'question_ar', 'answer_fr', 'answer_ar', 'category', 'sort_order', 'is_published'];
    const data = {};
    fields.forEach((f) => { if (req.body[f] !== undefined) data[f] = req.body[f]; });
    if ('sort_order' in data) data.sort_order = parseInt(data.sort_order);
    if ('is_published' in data) data.is_published = Boolean(data.is_published);

    const faq = await prisma.faqs.update({ where: { id }, data });
    return success(res, faq);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await prisma.faqs.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'FAQ');
    await prisma.faqs.delete({ where: { id } });
    return noContent(res);
  } catch (err) { next(err); }
};

module.exports = { list, getById, create, update, remove };
