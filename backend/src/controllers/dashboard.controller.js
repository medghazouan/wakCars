const prisma = require('../utils/prisma');
const { success } = require('../utils/apiResponse');

const getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalCars,
      activeCars,
      totalCustomers,
      activeReservations,
      pendingReservations,
      monthlyRevenue,
      yearlyRevenue,
      unpaidCount,
      alertCount,
    ] = await Promise.all([
      prisma.cars.count({ where: { is_active: true } }),
      prisma.cars.count({ where: { status: 'RENTED' } }),
      prisma.customers.count(),
      prisma.reservations.count({ where: { status: 'ACTIVE' } }),
      prisma.reservations.count({ where: { status: 'PENDING' } }),
      prisma.payments.aggregate({
        where: { status: 'PAID', created_at: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.payments.aggregate({
        where: { status: 'PAID', created_at: { gte: startOfYear } },
        _sum: { amount: true },
      }),
      prisma.reservations.count({
        where: { payment_status: { in: ['UNPAID', 'PARTIAL'] }, status: { in: ['CONFIRMED', 'ACTIVE'] } },
      }),
      prisma.reservations.count({
        where: { status: 'ACTIVE', dropoff_date: { lt: now }, actual_return_date: null },
      }),
    ]);

    return success(res, {
      fleet: { total: totalCars, rented: activeCars, available: totalCars - activeCars },
      customers: { total: totalCustomers },
      reservations: { active: activeReservations, pending: pendingReservations },
      revenue: {
        monthly: Number(monthlyRevenue._sum.amount || 0),
        yearly: Number(yearlyRevenue._sum.amount || 0),
      },
      alerts: { unpaidReservations: unpaidCount, overdueReturns: alertCount },
    });
  } catch (err) { next(err); }
};

module.exports = { getStats };
