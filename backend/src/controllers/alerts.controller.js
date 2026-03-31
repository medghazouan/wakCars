const prisma = require('../utils/prisma');
const { success } = require('../utils/apiResponse');

const EXPIRY_WINDOW_DAYS = 30;

const getAlerts = async (req, res, next) => {
  try {
    const now = new Date();
    const in30Days = new Date(now.getTime() + EXPIRY_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    const [
      overdueReservations,
      expiringInsurance,
      expiredInsurance,
      expiringTechVisits,
      unpaidReservations,
      unresolvedDamages,
    ] = await Promise.all([
      prisma.reservations.findMany({
        where: {
          status: 'ACTIVE',
          dropoff_date: { lt: now },
          actual_return_date: null,
        },
        include: {
          car: { select: { id: true, brand: true, model: true, license_plate: true } },
          customer: { select: { id: true, first_name: true, last_name: true, phone: true } },
        },
        orderBy: { dropoff_date: 'asc' },
      }),

      prisma.insurance_policies.findMany({
        where: {
          status: 'active',
          expiry_date: { gte: now, lte: in30Days },
        },
        include: {
          car: {
            select: {
              id: true,
              brand: true,
              model: true,
              license_plate: true,
              images: { take: 1, orderBy: { sort_order: 'asc' } },
            },
          },
        },
        orderBy: { expiry_date: 'asc' },
      }),

      prisma.insurance_policies.findMany({
        where: { status: 'expired' },
        include: {
          car: {
            select: {
              id: true,
              brand: true,
              model: true,
              license_plate: true,
              images: { take: 1, orderBy: { sort_order: 'asc' } },
            },
          },
        },
        orderBy: { expiry_date: 'desc' },
        take: 20,
      }),

      prisma.technical_visits.findMany({
        where: {
          expiration_date: { gte: now, lte: in30Days },
        },
        include: {
          car: {
            select: {
              id: true,
              brand: true,
              model: true,
              license_plate: true,
              images: { take: 1, orderBy: { sort_order: 'asc' } },
            },
          },
        },
        orderBy: { expiration_date: 'asc' },
      }),

      prisma.reservations.findMany({
        where: {
          payment_status: { in: ['UNPAID', 'PARTIAL'] },
          status: { in: ['CONFIRMED', 'ACTIVE', 'COMPLETED'] },
        },
        include: {
          car: { select: { id: true, brand: true, model: true } },
          customer: { select: { id: true, first_name: true, last_name: true, phone: true } },
        },
        orderBy: { pickup_date: 'asc' },
      }),

      prisma.damage_reports.findMany({
        where: { resolved: false },
        include: {
          car: { select: { id: true, brand: true, model: true, license_plate: true } },
          images: { take: 1 },
        },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return success(res, {
      summary: {
        overdueReservations: overdueReservations.length,
        expiringInsurance: expiringInsurance.length,
        expiredInsurance: expiredInsurance.length,
        expiringTechVisits: expiringTechVisits.length,
        unpaidReservations: unpaidReservations.length,
        unresolvedDamages: unresolvedDamages.length,
        total:
          overdueReservations.length +
          expiringInsurance.length +
          expiredInsurance.length +
          expiringTechVisits.length +
          unpaidReservations.length +
          unresolvedDamages.length,
      },
      overdueReservations,
      expiringInsurance,
      expiredInsurance,
      expiringTechVisits,
      unpaidReservations,
      unresolvedDamages,
    });
  } catch (err) { next(err); }
};

module.exports = { getAlerts };
