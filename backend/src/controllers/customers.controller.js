const prisma = require('../utils/prisma');
const { success, created, notFound } = require('../utils/apiResponse');

const list = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const where = search
      ? {
          OR: [
            { first_name: { contains: search } },
            { last_name: { contains: search } },
            { phone: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {};

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [customers, total] = await Promise.all([
      prisma.customers.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
      }),
      prisma.customers.count({ where }),
    ]);
    return success(res, customers, 200, { total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const customer = await prisma.customers.findUnique({ where: { id } });
    if (!customer) return notFound(res, 'Customer');

    const reservations = await prisma.reservations.findMany({
      where: { customer_id: id },
      include: {
        car: { select: { id: true, brand: true, model: true, year: true } },
        pickup_location: { select: { id: true, name_fr: true } },
        dropoff_location: { select: { id: true, name_fr: true } },
        payments: { select: { amount: true, method: true, status: true } },
      },
      orderBy: { pickup_date: 'desc' },
    });

    const totalSpent = reservations
      .flatMap((r) => r.payments)
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return success(res, { ...customer, reservations, totalSpent });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { first_name, last_name, email, phone, nationality, licence_country, licence_number, passport_number, notes } = req.body;
    const customer = await prisma.customers.create({
      data: { first_name, last_name, email, phone, nationality, licence_country, licence_number, passport_number, notes },
    });
    return created(res, customer);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await prisma.customers.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'Customer');

    const allowed = ['first_name', 'last_name', 'email', 'phone', 'nationality', 'licence_country', 'licence_number', 'passport_number', 'notes'];
    const data = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) data[key] = req.body[key]; });

    const customer = await prisma.customers.update({ where: { id }, data });
    return success(res, customer);
  } catch (err) { next(err); }
};

module.exports = { list, getById, create, update };
