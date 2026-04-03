const prisma = require('../utils/prisma');
const {
  attachCarsToReservations,
  attachCustomersToReservations,
} = require('../utils/attachCarsToReservations');
const { success } = require('../utils/apiResponse');

const EXPIRY_WINDOW_DAYS = 30;

const getAlerts = async (req, res, next) => {
  try {
    const now = new Date();
    const in30Days = new Date(now.getTime() + EXPIRY_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    const [
      overdueRows,
      expiringInsRows,
      expiredInsRows,
      expiringTechRows,
      unpaidRows,
      damageRows,
    ] = await Promise.all([
      prisma.reservations.findMany({
        where: {
          status: 'ACTIVE',
          dropoff_date: { lt: now },
          actual_return_date: null,
        },
        orderBy: { dropoff_date: 'asc' },
      }),

      prisma.insurance_policies.findMany({
        where: {
          status: 'active',
          expiry_date: { gte: now, lte: in30Days },
        },
        orderBy: { expiry_date: 'asc' },
      }),

      prisma.insurance_policies.findMany({
        where: { status: 'expired' },
        orderBy: { expiry_date: 'desc' },
        take: 20,
      }),

      prisma.technical_visits.findMany({
        where: {
          expiration_date: { gte: now, lte: in30Days },
        },
        orderBy: { expiration_date: 'asc' },
      }),

      prisma.reservations.findMany({
        where: {
          payment_status: { in: ['UNPAID', 'PARTIAL'] },
          status: { in: ['CONFIRMED', 'ACTIVE', 'COMPLETED'] },
        },
        orderBy: { pickup_date: 'asc' },
      }),

      prisma.damage_reports.findMany({
        where: { resolved: false },
        include: { images: { take: 1 } },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    const policyCarSelect = {
      id: true,
      brand: true,
      model: true,
      license_plate: true,
      images: { take: 1, orderBy: { sort_order: 'asc' } },
    };
    const policyCarPlaceholder = (carId) => ({
      id: carId,
      brand: '—',
      model: 'Vehicle removed',
      license_plate: '',
      images: [],
    });

    const overdueCarSelect = { id: true, brand: true, model: true, license_plate: true };
    const overduePlaceholder = (carId) => ({
      id: carId,
      brand: '—',
      model: 'Vehicle removed',
      license_plate: '',
    });
    const unpaidCarSelect = { id: true, brand: true, model: true };
    const unpaidPlaceholder = (carId) => ({ id: carId, brand: '—', model: 'Vehicle removed' });

    const customerSelect = { id: true, first_name: true, last_name: true, phone: true };
    const customerPlaceholder = (customerId) => ({
      id: customerId,
      first_name: '—',
      last_name: 'Compte supprimé',
      phone: null,
    });

    const [
      expiringInsurance,
      expiredInsurance,
      expiringTechVisits,
      unresolvedDamages,
      overdueWithCars,
      unpaidWithCars,
    ] = await Promise.all([
      attachCarsToReservations(expiringInsRows, policyCarSelect, policyCarPlaceholder),
      attachCarsToReservations(expiredInsRows, policyCarSelect, policyCarPlaceholder),
      attachCarsToReservations(expiringTechRows, policyCarSelect, policyCarPlaceholder),
      attachCarsToReservations(
        damageRows,
        { id: true, brand: true, model: true, license_plate: true },
        (carId) => ({ id: carId, brand: '—', model: 'Vehicle removed', license_plate: '' })
      ),
      attachCarsToReservations(overdueRows, overdueCarSelect, overduePlaceholder),
      attachCarsToReservations(unpaidRows, unpaidCarSelect, unpaidPlaceholder),
    ]);

    const [overdueReservations, unpaidReservations] = await Promise.all([
      attachCustomersToReservations(overdueWithCars, customerSelect, customerPlaceholder),
      attachCustomersToReservations(unpaidWithCars, customerSelect, customerPlaceholder),
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
