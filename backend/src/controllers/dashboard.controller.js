const prisma = require('../utils/prisma');
const { success } = require('../utils/apiResponse');

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfLocalDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** @param {{ status: string; expiry_date: Date }[]} policies */
function insuranceBucket(policies, today, in30) {
  if (!policies.length) return 'critical';
  const active = policies.filter((p) => p.status === 'active');
  if (!active.length) return 'critical';
  const best = active.reduce((max, p) => {
    const t = new Date(p.expiry_date).getTime();
    return t > max ? t : max;
  }, 0);
  const exp = new Date(best);
  if (exp < today) return 'critical';
  if (exp <= in30) return 'dueSoon';
  return 'compliant';
}

/** @param {{ expiration_date: Date | null }[]} visits */
function techBucket(visits, today, in30) {
  if (!visits.length) return 'compliant';
  const withExp = visits.filter((v) => v.expiration_date != null);
  if (!withExp.length) return 'compliant';
  const latest = withExp.reduce((max, v) => {
    const t = new Date(v.expiration_date).getTime();
    return t > max ? t : max;
  }, 0);
  const exp = new Date(latest);
  if (exp < today) return 'critical';
  if (exp <= in30) return 'dueSoon';
  return 'compliant';
}

const getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const today = startOfLocalDay(now);
    const in30Days = addDays(today, 30);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const last24h = new Date(now.getTime() - DAY_MS);
    const timelineEnd = addDays(now, 7);

    const [
      totalCars,
      availableCount,
      maintenanceCount,
      rentedCount,
      inactiveCount,
      locationsCount,
      newCarsThisMonth,
      newCarsPrevMonth,
      totalCustomers,
      activeReservations,
      pendingReservations,
      confirmedPlusActive,
      reservationsLast24h,
      monthlyRevenueAgg,
      yearlyRevenueAgg,
      prevMonthRevenueAgg,
      unpaidCount,
      overdueReturnsCount,
      upcomingReservations,
    ] = await Promise.all([
      prisma.cars.count({ where: { is_active: true } }),
      prisma.cars.count({ where: { is_active: true, status: 'AVAILABLE' } }),
      prisma.cars.count({ where: { is_active: true, status: 'MAINTENANCE' } }),
      prisma.cars.count({ where: { is_active: true, status: 'RENTED' } }),
      prisma.cars.count({ where: { is_active: true, status: 'INACTIVE' } }),
      prisma.locations.count(),
      prisma.cars.count({ where: { created_at: { gte: startOfMonth } } }),
      prisma.cars.count({
        where: {
          created_at: { gte: startPrevMonth, lt: startOfMonth },
        },
      }),
      prisma.customers.count(),
      prisma.reservations.count({ where: { status: 'ACTIVE' } }),
      prisma.reservations.count({ where: { status: 'PENDING' } }),
      prisma.reservations.count({ where: { status: { in: ['CONFIRMED', 'ACTIVE'] } } }),
      prisma.reservations.count({ where: { created_at: { gte: last24h } } }),
      prisma.payments.aggregate({
        where: { status: 'PAID', created_at: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.payments.aggregate({
        where: { status: 'PAID', created_at: { gte: startOfYear } },
        _sum: { amount: true },
      }),
      prisma.payments.aggregate({
        where: {
          status: 'PAID',
          created_at: { gte: startPrevMonth, lte: endPrevMonth },
        },
        _sum: { amount: true },
      }),
      prisma.reservations.count({
        where: {
          payment_status: { in: ['UNPAID', 'PARTIAL'] },
          status: { in: ['CONFIRMED', 'ACTIVE'] },
        },
      }),
      prisma.reservations.count({
        where: { status: 'ACTIVE', dropoff_date: { lt: now }, actual_return_date: null },
      }),
      prisma.reservations.findMany({
        where: {
          pickup_date: { gte: now, lte: timelineEnd },
          status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
        },
        orderBy: { pickup_date: 'asc' },
        take: 8,
        include: {
          customer: { select: { first_name: true, last_name: true } },
          car: {
            select: {
              brand: true,
              model: true,
              images: { take: 1, orderBy: { sort_order: 'asc' } },
            },
          },
          pickup_location: { select: { name_fr: true, name_ar: true } },
        },
      }),
    ]);

    const dow = today.getDay();
    let weekendStart;
    let weekendEnd;
    if (dow === 0) {
      weekendStart = addDays(today, -1);
      weekendEnd = new Date(today);
    } else if (dow === 6) {
      weekendStart = new Date(today);
      weekendEnd = addDays(today, 1);
    } else {
      weekendStart = addDays(today, 6 - dow);
      weekendEnd = addDays(weekendStart, 1);
    }
    weekendEnd.setHours(23, 59, 59, 999);

    const weekendPickupCount = await prisma.reservations.count({
      where: {
        status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
        pickup_date: { gte: weekendStart, lte: weekendEnd },
      },
    });

    const carsForCompliance = await prisma.cars.findMany({
      where: { is_active: true },
      select: {
        id: true,
        insurance_policies: { select: { status: true, expiry_date: true } },
        technical_visits: { select: { expiration_date: true } },
      },
    });

    let insCompliant = 0;
    let insDueSoon = 0;
    let insCritical = 0;
    let techCompliant = 0;
    let techDueSoon = 0;
    let techCritical = 0;

    for (const car of carsForCompliance) {
      const ib = insuranceBucket(car.insurance_policies, today, in30Days);
      if (ib === 'compliant') insCompliant += 1;
      else if (ib === 'dueSoon') insDueSoon += 1;
      else insCritical += 1;

      const tb = techBucket(car.technical_visits, today, in30Days);
      if (tb === 'compliant') techCompliant += 1;
      else if (tb === 'dueSoon') techDueSoon += 1;
      else techCritical += 1;
    }

    const fleetTotal = totalCars;
    const reviewPending = techDueSoon + techCritical;

    const insTotalClassified = insCompliant + insDueSoon + insCritical;
    const techTotalClassified = techCompliant + techDueSoon + techCritical;

    const pct = (n, d) => (d > 0 ? Math.round((n / d) * 100) : 0);

    const monthly = Number(monthlyRevenueAgg._sum.amount || 0);
    const prevMonthly = Number(prevMonthRevenueAgg._sum.amount || 0);
    const revenueMomPct =
      prevMonthly > 0 ? Math.round(((monthly - prevMonthly) / prevMonthly) * 100) : monthly > 0 ? 100 : 0;

    const fleetMomPct =
      newCarsPrevMonth > 0
        ? Math.round(((newCarsThisMonth - newCarsPrevMonth) / newCarsPrevMonth) * 100)
        : newCarsThisMonth > 0
          ? 100
          : 0;

    const occupancyPct =
      fleetTotal > 0 ? Math.round((rentedCount / fleetTotal) * 100) : 0;

    let fleetHealthScore = 100;
    if (fleetTotal > 0) {
      const availW = (availableCount / fleetTotal) * 45;
      const maintW = (1 - maintenanceCount / fleetTotal) * 25;
      const revW = (1 - Math.min(1, reviewPending / fleetTotal)) * 30;
      fleetHealthScore = Math.round(Math.min(100, Math.max(0, availW + maintW + revW)));
    }

    const techQualityScore =
      techTotalClassified > 0
        ? Math.round((techCompliant / techTotalClassified) * 100) / 10
        : 10;

    const insQualityScore =
      insTotalClassified > 0
        ? Math.round((insCompliant / insTotalClassified) * 100) / 10
        : 10;

    const monthLabel = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();

    const timeline = upcomingReservations.map((r) => {
      const pickup = new Date(r.pickup_date);
      const hours = pickup.getHours().toString().padStart(2, '0');
      const mins = pickup.getMinutes().toString().padStart(2, '0');
      const loc =
        r.pickup_location?.name_fr ||
        r.pickup_location?.name_ar ||
        'Pickup location';
      const guest = r.customer
        ? `${r.customer.first_name} ${r.customer.last_name}`
        : 'Guest';
      const vehicle = r.car ? `${r.car.brand} ${r.car.model}` : 'Vehicle';
      const title = `${vehicle} — pickup`;
      const within48h = pickup.getTime() - now.getTime() < 2 * DAY_MS;
      const badge = within48h ? 'URGENT' : 'READY';
      return {
        id: r.id,
        timeLabel: `${hours}:${mins}`,
        title,
        subtitle: `${guest} • ${loc}`,
        badge,
      };
    });

    return success(res, {
      fleet: {
        total: fleetTotal,
        available: availableCount,
        rented: rentedCount,
        maintenance: maintenanceCount,
        inactive: inactiveCount,
        reviewPending,
        locationsCount,
        newThisMonth: newCarsThisMonth,
        monthOverMonthPct: fleetMomPct,
      },
      customers: { total: totalCustomers },
      reservations: {
        active: activeReservations,
        pending: pendingReservations,
        activeBookings: confirmedPlusActive,
        newLast24h: reservationsLast24h,
        timeline,
        weekendPickupCount,
      },
      revenue: {
        monthly,
        yearly: Number(yearlyRevenueAgg._sum.amount || 0),
        prevMonth: prevMonthly,
        monthOverMonthPct: revenueMomPct,
        monthLabel,
      },
      alerts: { unpaidReservations: unpaidCount, overdueReturns: overdueReturnsCount },
      occupancy: { ratePct: occupancyPct },
      insurance: {
        compliant: insCompliant,
        dueSoon: insDueSoon,
        critical: insCritical,
        compliantPct: pct(insCompliant, insTotalClassified),
        dueSoonPct: pct(insDueSoon, insTotalClassified),
        criticalPct: pct(insCritical, insTotalClassified),
        qualityScore: insQualityScore,
      },
      technical: {
        compliant: techCompliant,
        dueSoon: techDueSoon,
        critical: techCritical,
        compliantPct: pct(techCompliant, techTotalClassified),
        dueSoonPct: pct(techDueSoon, techTotalClassified),
        criticalPct: pct(techCritical, techTotalClassified),
        qualityScore: techQualityScore,
      },
      fleetHealthScore,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats };
