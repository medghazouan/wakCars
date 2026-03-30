const prisma = require('../utils/prisma');
const { success, created, noContent, notFound, fail } = require('../utils/apiResponse');

const list = async (req, res, next) => {
  try {
    const { is_active } = req.query;
    const where = {};
    if (is_active !== undefined) where.is_active = is_active === 'true' || is_active === '1';

    const categories = await prisma.car_categories.findMany({
      where,
      orderBy: { sort_order: 'asc' },
      include: { _count: { select: { cars: { where: { is_active: true } } } } },
    });
    return success(res, categories);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const category = await prisma.car_categories.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { _count: { select: { cars: true } } },
    });
    if (!category) return notFound(res, 'Category');
    return success(res, category);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { name_fr, name_ar, slug, desc_fr, desc_ar, sort_order = 0 } = req.body;
    const category = await prisma.car_categories.create({
      data: { name_fr, name_ar, slug, desc_fr, desc_ar, sort_order: parseInt(sort_order) },
    });
    return created(res, category);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await prisma.car_categories.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'Category');

    const { name_fr, name_ar, slug, desc_fr, desc_ar, sort_order, is_active } = req.body;
    const data = {};
    if (name_fr !== undefined) data.name_fr = name_fr;
    if (name_ar !== undefined) data.name_ar = name_ar;
    if (slug !== undefined) data.slug = slug;
    if (desc_fr !== undefined) data.desc_fr = desc_fr;
    if (desc_ar !== undefined) data.desc_ar = desc_ar;
    if (sort_order !== undefined) data.sort_order = parseInt(sort_order);
    if (is_active !== undefined) data.is_active = Boolean(is_active);

    const category = await prisma.car_categories.update({ where: { id }, data });
    return success(res, category);
  } catch (err) { next(err); }
};

const deactivate = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await prisma.car_categories.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'Category');

    const activeCars = await prisma.cars.count({ where: { category_id: id, is_active: true } });
    if (activeCars > 0) {
      return fail(res, `Cannot deactivate: category has ${activeCars} active car(s)`, 409);
    }
    await prisma.car_categories.update({ where: { id }, data: { is_active: false } });
    return noContent(res);
  } catch (err) { next(err); }
};

module.exports = { list, getById, create, update, deactivate };
