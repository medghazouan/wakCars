const prisma = require('../utils/prisma');
const { success, fail } = require('../utils/apiResponse');

const MIN_LEN = 2;
const MAX_LEN = 80;
const TAKE = 5;

function reservationWhere(q) {
  const trimmed = q.trim();
  const idNum = parseInt(trimmed, 10);
  const numericOnly = /^\d+$/.test(trimmed);
  const textOr = [
    {
      customer: {
        OR: [
          { first_name: { contains: q } },
          { last_name: { contains: q } },
          { phone: { contains: q } },
          { email: { contains: q } },
        ],
      },
    },
    {
      car: {
        OR: [
          { brand: { contains: q } },
          { model: { contains: q } },
          { license_plate: { contains: q } },
        ],
      },
    },
  ];
  if (numericOnly && !Number.isNaN(idNum)) {
    return { OR: [{ id: idNum }, ...textOr] };
  }
  return { OR: textOr };
}

const search = async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    if (q.length < MIN_LEN) {
      return success(res, { customers: [], cars: [], reservations: [] });
    }
    if (q.length > MAX_LEN) {
      return fail(res, `Search query must be at most ${MAX_LEN} characters`, 400);
    }

    const [customers, cars, reservations] = await Promise.all([
      prisma.customers.findMany({
        where: {
          OR: [
            { first_name: { contains: q } },
            { last_name: { contains: q } },
            { phone: { contains: q } },
            { email: { contains: q } },
          ],
        },
        take: TAKE,
        orderBy: { created_at: 'desc' },
        select: { id: true, first_name: true, last_name: true, phone: true, email: true },
      }),
      prisma.cars.findMany({
        where: {
          OR: [
            { brand: { contains: q } },
            { model: { contains: q } },
            { license_plate: { contains: q } },
            { slug: { contains: q } },
          ],
        },
        take: TAKE,
        orderBy: { created_at: 'desc' },
        select: { id: true, brand: true, model: true, year: true, license_plate: true, slug: true },
      }),
      prisma.reservations.findMany({
        where: reservationWhere(q),
        take: TAKE,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          status: true,
          pickup_date: true,
          customer: { select: { first_name: true, last_name: true, phone: true } },
          car: { select: { brand: true, model: true } },
        },
      }),
    ]);

    return success(res, { customers, cars, reservations });
  } catch (err) {
    next(err);
  }
};

module.exports = { search };
