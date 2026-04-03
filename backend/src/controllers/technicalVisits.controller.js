const prisma = require('../utils/prisma');
const { attachCarsToReservations } = require('../utils/attachCarsToReservations');
const { success, created, noContent, notFound } = require('../utils/apiResponse');

const CAR_SELECT = {
  id: true,
  brand: true,
  model: true,
  license_plate: true,
  category_id: true,
};
const placeholderCar = (carId) => ({
  id: carId,
  brand: '—',
  model: 'Vehicle removed',
  license_plate: '',
});

const list = async (req, res, next) => {
  try {
    const { car_id, expiry_before, expiry_after, page = 1, limit = 20 } = req.query;
    const where = {};
    if (car_id) where.car_id = parseInt(car_id);
    if (expiry_before || expiry_after) {
      where.expiration_date = {};
      if (expiry_before) where.expiration_date.lte = new Date(expiry_before);
      if (expiry_after) where.expiration_date.gte = new Date(expiry_after);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [rows, total] = await Promise.all([
      prisma.technical_visits.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { visit_date: 'desc' },
      }),
      prisma.technical_visits.count({ where }),
    ]);
    const visits = await attachCarsToReservations(rows, CAR_SELECT, placeholderCar);
    return success(res, visits, 200, { total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const row = await prisma.technical_visits.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!row) return notFound(res, 'Technical visit');
    const [visit] = await attachCarsToReservations([row], CAR_SELECT, placeholderCar);
    return success(res, visit);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { car_id, cost, visit_date, expiration_date } = req.body;
    const row = await prisma.technical_visits.create({
      data: {
        car_id: parseInt(car_id),
        cost: cost ? parseFloat(cost) : undefined,
        visit_date: new Date(visit_date),
        expiration_date: expiration_date ? new Date(expiration_date) : undefined,
      },
    });
    const [visit] = await attachCarsToReservations([row], CAR_SELECT, placeholderCar);
    return created(res, visit);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await prisma.technical_visits.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'Technical visit');

    const { cost, visit_date, expiration_date } = req.body;
    const data = {};
    if (cost !== undefined) data.cost = parseFloat(cost);
    if (visit_date !== undefined) data.visit_date = new Date(visit_date);
    if (expiration_date !== undefined) data.expiration_date = new Date(expiration_date);

    const row = await prisma.technical_visits.update({
      where: { id },
      data,
    });
    const [visit] = await attachCarsToReservations([row], CAR_SELECT, placeholderCar);
    return success(res, visit);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await prisma.technical_visits.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'Technical visit');
    await prisma.technical_visits.delete({ where: { id } });
    return noContent(res);
  } catch (err) { next(err); }
};

module.exports = { list, getById, create, update, remove };
