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

function dateKeyLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function endOfLocalDay(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setHours(23, 59, 59, 999);
  return x;
}

/** Sum PAID payment amounts per local calendar day */
function paymentsByDayMap(payments) {
  const map = new Map();
  for (const p of payments) {
    const key = dateKeyLocal(new Date(p.created_at));
    const amt = Number(p.amount);
    map.set(key, (map.get(key) || 0) + amt);
  }
  return map;
}

function sumPaymentsBetween(map, startDay, endDay) {
  let s = 0;
  for (let d = new Date(startDay); d <= endDay; d = addDays(d, 1)) {
    s += map.get(dateKeyLocal(d)) || 0;
  }
  return s;
}

function countReservationsBetween(rows, start, endInclusive) {
  const end = endOfLocalDay(endInclusive);
  return rows.filter((r) => {
    const c = new Date(r.created_at);
    return c >= start && c <= end;
  }).length;
}

/**
 * Build chart payloads: daily (7d), weekly (4×7d), monthly (6 cal. months).
 */
function buildRevenueChart(payments, reservations, today) {
  const map = paymentsByDayMap(payments);

  // —— Daily: last 7 days ——
  const dailyPoints = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = addDays(today, -i);
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const amount = map.get(dateKeyLocal(d)) || 0;
    dailyPoints.push({ label, amount });
  }
  const dailyTotal = dailyPoints.reduce((a, p) => a + p.amount, 0);
  const dailyStart = addDays(today, -6);
  const dailyEnd = today;
  const dailyBookings = countReservationsBetween(reservations, dailyStart, dailyEnd);
  const dailyAvg = dailyBookings > 0 ? dailyTotal / dailyBookings : dailyTotal;
  let peakDay = '—';
  let peakAmt = -1;
  for (const p of dailyPoints) {
    if (p.amount > peakAmt) {
      peakAmt = p.amount;
      peakDay = p.label;
    }
  }
  if (peakAmt <= 0) peakDay = '—';

  const prevWeekStart = addDays(today, -13);
  const prevWeekEnd = addDays(today, -7);
  const thisWeekTotal = sumPaymentsBetween(map, dailyStart, dailyEnd);
  const prevWeekTotal = sumPaymentsBetween(map, prevWeekStart, prevWeekEnd);
  const dailyVsPrevPct =
    prevWeekTotal > 0
      ? Math.round(((thisWeekTotal - prevWeekTotal) / prevWeekTotal) * 1000) / 10
      : thisWeekTotal > 0
        ? 100
        : 0;

  // —— Weekly: last 4 weeks (each 7 days, oldest first) ——
  const weeklyPoints = [];
  for (let w = 3; w >= 0; w -= 1) {
    const weekEnd = addDays(today, -w * 7);
    const weekStart = addDays(weekEnd, -6);
    const amount = sumPaymentsBetween(map, weekStart, weekEnd);
    const label = `W${4 - w}`;
    weeklyPoints.push({ label, amount });
  }
  const weeklyRangeStart = addDays(today, -27);
  const last4Total = sumPaymentsBetween(map, weeklyRangeStart, today);
  const weeklyBookings = countReservationsBetween(reservations, weeklyRangeStart, today);
  const weeklyAvg = weeklyBookings > 0 ? last4Total / weeklyBookings : last4Total;
  let peakWeek = '—';
  let peakW = -1;
  for (const p of weeklyPoints) {
    if (p.amount > peakW) {
      peakW = p.amount;
      peakWeek = p.label;
    }
  }
  if (peakW <= 0) peakWeek = '—';

  const prior4Start = addDays(today, -55);
  const prior4End = addDays(today, -28);
  const prior4Total = sumPaymentsBetween(map, prior4Start, prior4End);
  const weeklyVsPrevPct =
    prior4Total > 0
      ? Math.round(((last4Total - prior4Total) / prior4Total) * 1000) / 10
      : last4Total > 0
        ? 100
        : 0;

  // —— Monthly: last 6 calendar months (oldest first) ——
  const monthlyPoints = [];
  for (let i = 5; i >= 0; i -= 1) {
    const ref = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const mStart = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const mEnd = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
    const amount = sumPaymentsBetween(map, mStart, mEnd);
    const label = mStart.toLocaleDateString('en-US', { month: 'short' });
    monthlyPoints.push({ label, amount });
  }
  const monthlyTotal = monthlyPoints.reduce((a, p) => a + p.amount, 0);
  const sixMoStart = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  const monthlyBookings = countReservationsBetween(reservations, sixMoStart, today);
  const monthlyAvg = monthlyBookings > 0 ? monthlyTotal / monthlyBookings : monthlyTotal;
  let peakMonth = '—';
  let peakM = -1;
  for (const p of monthlyPoints) {
    if (p.amount > peakM) {
      peakM = p.amount;
      peakMonth = p.label;
    }
  }
  if (peakM <= 0) peakMonth = '—';

  let priorSixTotal = 0;
  for (let i = 11; i >= 6; i -= 1) {
    const ref = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const mStart = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const mEnd = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
    priorSixTotal += sumPaymentsBetween(map, mStart, mEnd);
  }
  const monthlyVsPrevPct =
    priorSixTotal > 0
      ? Math.round(((monthlyTotal - priorSixTotal) / priorSixTotal) * 1000) / 10
      : monthlyTotal > 0
        ? 100
        : 0;

  return {
    daily: {
      points: dailyPoints,
      total: thisWeekTotal,
      bookings: dailyBookings,
      avgPerBooking: dailyAvg,
      peakLabel: peakDay,
      vsPreviousPct: dailyVsPrevPct,
      compareLabel: 'last week',
    },
    weekly: {
      points: weeklyPoints,
      total: last4Total,
      bookings: weeklyBookings,
      avgPerBooking: weeklyAvg,
      peakLabel: peakWeek,
      vsPreviousPct: weeklyVsPrevPct,
      compareLabel: 'prior 4 weeks',
    },
    monthly: {
      points: monthlyPoints,
      total: monthlyTotal,
      bookings: monthlyBookings,
      avgPerBooking: monthlyAvg,
      peakLabel: peakMonth,
      vsPreviousPct: monthlyVsPrevPct,
      compareLabel: 'prior 6 months',
    },
  };
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

    const chartLookback = addDays(today, -370);
    const [chartPayments, chartReservationDates] = await Promise.all([
      prisma.payments.findMany({
        where: { status: 'PAID', created_at: { gte: chartLookback } },
        select: { amount: true, created_at: true },
      }),
      prisma.reservations.findMany({
        where: { created_at: { gte: chartLookback } },
        select: { created_at: true },
      }),
    ]);
    const revenueChart = buildRevenueChart(chartPayments, chartReservationDates, today);

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

    /** Earliest current inspection expiry: per car = latest visit expiration; fleet = minimum of those. */
    let soonestTechExpiration = null;
    for (const car of carsForCompliance) {
      const withExp = car.technical_visits.filter((v) => v.expiration_date != null);
      if (!withExp.length) continue;
      const latestMs = withExp.reduce((max, v) => {
        const t = new Date(v.expiration_date).getTime();
        return t > max ? t : max;
      }, 0);
      const d = new Date(latestMs);
      if (soonestTechExpiration === null || d.getTime() < soonestTechExpiration.getTime()) {
        soonestTechExpiration = d;
      }
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
      const dayOfMonth = pickup.getDate();
      const monthShort = pickup.toLocaleString('en-US', { month: 'short' });
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
        dateLabel: `${dayOfMonth} ${monthShort}`,
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
        soonestExpiration: soonestTechExpiration ? soonestTechExpiration.toISOString() : null,
      },
      fleetHealthScore,
      revenueChart,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats };
