const prisma = require('../utils/prisma');
const { success, created, noContent, notFound } = require('../utils/apiResponse');

const list = async (req, res, next) => {
  try {
    const { car_id, status, expiry_before, expiry_after, page = 1, limit = 20 } = req.query;
    const where = {};
    if (car_id) where.car_id = parseInt(car_id);
    if (status) where.status = status;
    if (expiry_before || expiry_after) {
      where.expiry_date = {};
      if (expiry_before) where.expiry_date.lte = new Date(expiry_before);
      if (expiry_after) where.expiry_date.gte = new Date(expiry_after);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [policies, total] = await Promise.all([
      prisma.insurance_policies.findMany({
        where,
        include: { car: { select: { id: true, brand: true, model: true, license_plate: true } } },
        skip,
        take: parseInt(limit),
        orderBy: { expiry_date: 'asc' },
      }),
      prisma.insurance_policies.count({ where }),
    ]);
    return success(res, policies, 200, { total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const policy = await prisma.insurance_policies.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { car: true },
    });
    if (!policy) return notFound(res, 'Insurance policy');
    return success(res, policy);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { car_id, provider, policy_number, start_date, expiry_date, notes } = req.body;
    const now = new Date();
    const expiry = new Date(expiry_date);
    const status = expiry < now ? 'expired' : 'active';

    const policy = await prisma.insurance_policies.create({
      data: {
        car_id: parseInt(car_id), provider, policy_number,
        start_date: new Date(start_date), expiry_date: expiry,
        status, notes,
      },
      include: { car: { select: { id: true, brand: true, model: true } } },
    });
    return created(res, policy);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await prisma.insurance_policies.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'Insurance policy');

    const { provider, policy_number, start_date, expiry_date, status, notes } = req.body;
    const data = {};
    if (provider !== undefined) data.provider = provider;
    if (policy_number !== undefined) data.policy_number = policy_number;
    if (start_date !== undefined) data.start_date = new Date(start_date);
    if (expiry_date !== undefined) {
      data.expiry_date = new Date(expiry_date);
      data.status = new Date(expiry_date) < new Date() ? 'expired' : 'active';
    }
    if (status !== undefined) data.status = status;
    if (notes !== undefined) data.notes = notes;

    const policy = await prisma.insurance_policies.update({ where: { id }, data });
    return success(res, policy);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await prisma.insurance_policies.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'Insurance policy');
    await prisma.insurance_policies.delete({ where: { id } });
    return noContent(res);
  } catch (err) { next(err); }
};

module.exports = { list, getById, create, update, remove };
