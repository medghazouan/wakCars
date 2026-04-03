const prisma = require('../utils/prisma');
const { stringify } = require('csv-stringify/sync');
const pdfService = require('../services/pdf.service');
const { success, fail } = require('../utils/apiResponse');

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const endOfDay = (d) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

/** GET /reports/utilization — explicit dates or full calendar year (includes future pickups in-year). */
const getUtilizationRangeList = (from, to) => {
  if (from && to) {
    return { gte: startOfDay(new Date(from)), lte: endOfDay(new Date(to)) };
  }
  const y = new Date().getFullYear();
  return { gte: new Date(y, 0, 1), lte: new Date(y, 11, 31, 23, 59, 59, 999) };
};

/** Export utilization — same explicit dates, or period-aligned window (month end, not “now”). */
const getUtilizationRangeExport = (period, from, to) => {
  if (from && to) {
    return { gte: startOfDay(new Date(from)), lte: endOfDay(new Date(to)) };
  }
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  switch (period) {
    case 'daily':
      return { gte: new Date(y, m, d), lte: endOfDay(new Date(y, m, d)) };
    case 'annual':
      return { gte: new Date(y, 0, 1), lte: new Date(y, 11, 31, 23, 59, 59, 999) };
    case 'monthly':
    default: {
      const last = new Date(y, m + 1, 0);
      return { gte: new Date(y, m, 1), lte: endOfDay(last) };
    }
  }
};

/** Rental overlaps [gte, lte]: not cancelled/no-show, and interval intersects report window. */
const utilizationReservationWhere = (range) => ({
  status: { notIn: ['CANCELLED', 'NO_SHOW'] },
  AND: [{ pickup_date: { lte: range.lte } }, { dropoff_date: { gte: range.gte } }],
});

const rentedDaysInRange = (r, range) => {
  const rawStart = new Date(r.pickup_date);
  const rawEnd = new Date(r.actual_return_date || r.dropoff_date);
  const clipStart = new Date(Math.max(rawStart.getTime(), range.gte.getTime()));
  const clipEnd = new Date(Math.min(rawEnd.getTime(), range.lte.getTime()));
  if (clipEnd <= clipStart) return 0;
  return Math.max(0, Math.ceil((clipEnd - clipStart) / (1000 * 60 * 60 * 24)));
};

const fetchUtilizationCars = (range) =>
  prisma.cars.findMany({
    where: { is_active: true },
    select: {
      id: true,
      brand: true,
      model: true,
      year: true,
      license_plate: true,
      reservations: {
        where: utilizationReservationWhere(range),
        select: {
          pickup_date: true,
          dropoff_date: true,
          actual_return_date: true,
          total_amount: true,
        },
      },
    },
  });

const getDateRange = (period, from, to) => {
  const now = new Date();
  if (from && to) return { gte: new Date(from), lte: new Date(to) };
  switch (period) {
    case 'daily':
      return { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()), lte: now };
    case 'monthly':
      return { gte: new Date(now.getFullYear(), now.getMonth(), 1), lte: now };
    case 'annual':
      return { gte: new Date(now.getFullYear(), 0, 1), lte: now };
    default:
      return { gte: new Date(now.getFullYear(), now.getMonth(), 1), lte: now };
  }
};

const revenue = async (req, res, next) => {
  try {
    const { period = 'monthly', from, to } = req.query;
    const dateRange = getDateRange(period, from, to);

    const payments = await prisma.payments.findMany({
      where: { status: 'PAID', created_at: dateRange },
      include: {
        reservation: {
          select: {
            id: true, pickup_date: true, dropoff_date: true,
            car: { select: { brand: true, model: true } },
            customer: { select: { first_name: true, last_name: true } },
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const byMethod = payments.reduce((acc, p) => {
      acc[p.method] = (acc[p.method] || 0) + Number(p.amount);
      return acc;
    }, {});

    const byDay = payments.reduce((acc, p) => {
      const day = p.created_at.toISOString().slice(0, 10);
      acc[day] = (acc[day] || 0) + Number(p.amount);
      return acc;
    }, {});

    return success(res, { period, dateRange, total, byMethod, byDay, payments });
  } catch (err) { next(err); }
};

const utilization = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const dateRange = getUtilizationRangeList(from, to);
    const cars = await fetchUtilizationCars(dateRange);

    const data = cars.map((car) => {
      const rentedDays = car.reservations.reduce((sum, r) => sum + rentedDaysInRange(r, dateRange), 0);
      const totalRevenue = car.reservations.reduce((sum, r) => sum + Number(r.total_amount), 0);
      return {
        id: car.id,
        vehicle: `${car.brand} ${car.model} (${car.year})`,
        license_plate: car.license_plate,
        reservations: car.reservations.length,
        rentedDays,
        totalRevenue,
      };
    });

    data.sort((a, b) => b.rentedDays - a.rentedDays);
    return success(res, data);
  } catch (err) { next(err); }
};

const reservationAnalytics = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const where = {};
    if (from && to) {
      where.created_at = { gte: new Date(from), lte: new Date(to) };
    }

    const [byStatus, byPaymentStatus, total] = await Promise.all([
      prisma.reservations.groupBy({ by: ['status'], where, _count: { id: true } }),
      prisma.reservations.groupBy({ by: ['payment_status'], where, _count: { id: true } }),
      prisma.reservations.count({ where }),
    ]);

    return success(res, {
      total,
      byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r._count.id])),
      byPaymentStatus: Object.fromEntries(byPaymentStatus.map((r) => [r.payment_status, r._count.id])),
    });
  } catch (err) { next(err); }
};

/** PRD: booking source report — group counts by reservations.booking_source */
const bookingSources = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const where = {};
    if (from && to) where.created_at = { gte: new Date(from), lte: new Date(to) };

    const rows = await prisma.reservations.groupBy({
      by: ['booking_source'],
      where,
      _count: { id: true },
    });
    const total = await prisma.reservations.count({ where });
    const bySource = rows
      .map((r) => ({ source: r.booking_source, count: r._count.id }))
      .sort((a, b) => b.count - a.count);
    return success(res, { total, bySource });
  } catch (err) { next(err); }
};

const exportReport = async (req, res, next) => {
  try {
    const { type = 'revenue', format = 'csv', period = 'monthly', from, to } = req.query;
    const dateRange = getDateRange(period, from, to);

    if (type === 'revenue') {
      const payments = await prisma.payments.findMany({
        where: { status: 'PAID', created_at: dateRange },
        include: {
          reservation: {
            select: { id: true, car: { select: { brand: true, model: true } } },
          },
          recorded_by: { select: { name: true } },
        },
        orderBy: { created_at: 'asc' },
      });

      const rows = payments.map((p) => ({
        Date: p.created_at.toLocaleDateString('fr-FR'),
        'Réservation': p.reservation_id,
        Véhicule: `${p.reservation?.car?.brand || ''} ${p.reservation?.car?.model || ''}`,
        Méthode: p.method,
        'Montant (MAD)': Number(p.amount).toFixed(2),
        Référence: p.reference || '—',
        'Enregistré par': p.recorded_by?.name || '—',
      }));

      if (format === 'csv') {
        const csv = stringify(rows, { header: true });
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="revenue-${period}.csv"`);
        return res.send('\uFEFF' + csv);
      }

      if (format === 'pdf') {
        const columns = ['Date', 'Réservation', 'Véhicule', 'Méthode', 'Montant (MAD)', 'Référence', 'Enregistré par'];
        const rowArrays = rows.map((r) => columns.map((c) => r[c]));
        const pdf = await pdfService.generateReportPDF(`Rapport de revenus — ${period}`, rowArrays, columns);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="revenue-${period}.pdf"`);
        return res.send(pdf);
      }
    }

    if (type === 'utilization') {
      const utilRange = getUtilizationRangeExport(period, from, to);
      const cars = await fetchUtilizationCars(utilRange);

      const rows = cars.map((car) => {
        const rentedDays = car.reservations.reduce((sum, r) => sum + rentedDaysInRange(r, utilRange), 0);
        const totalRevenue = car.reservations.reduce((sum, r) => sum + Number(r.total_amount), 0);
        return {
          ID: car.id,
          Véhicule: `${car.brand} ${car.model} (${car.year})`,
          Immatriculation: car.license_plate,
          Réservations: car.reservations.length,
          'Jours loués': rentedDays,
          'Revenus (MAD)': totalRevenue.toFixed(2),
        };
      });

      if (format === 'csv') {
        const csv = stringify(rows, { header: true });
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="utilisation-flotte.csv"');
        return res.send('\uFEFF' + csv);
      }

      if (format === 'pdf') {
        const columns = ['ID', 'Véhicule', 'Immatriculation', 'Réservations', 'Jours loués', 'Revenus (MAD)'];
        const rowArrays = rows.map((r) => columns.map((c) => r[c]));
        const pdf = await pdfService.generateReportPDF('Utilisation de la flotte', rowArrays, columns);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="utilisation-flotte.pdf"');
        return res.send(pdf);
      }
    }

    if (type === 'booking_sources') {
      const reservations = await prisma.reservations.findMany({
        where: { created_at: dateRange },
        select: {
          id: true,
          booking_source: true,
          created_at: true,
          status: true,
          car: { select: { brand: true, model: true, license_plate: true } },
          customer: { select: { first_name: true, last_name: true, phone: true } },
        },
        orderBy: { created_at: 'desc' },
      });

      const rows = reservations.map((r) => ({
        ID: r.id,
        Source: r.booking_source,
        Statut: r.status,
        Véhicule: r.car ? `${r.car.brand} ${r.car.model}` : '—',
        Immatriculation: r.car?.license_plate || '—',
        Client: r.customer ? `${r.customer.first_name} ${r.customer.last_name}` : '—',
        Téléphone: r.customer?.phone || '—',
        Date: r.created_at.toLocaleDateString('fr-FR'),
      }));

      if (format === 'csv') {
        const csv = stringify(rows, { header: true });
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="sources-reservations-${period}.csv"`);
        return res.send('\uFEFF' + csv);
      }

      if (format === 'pdf') {
        const columns = ['ID', 'Source', 'Statut', 'Véhicule', 'Immatriculation', 'Client', 'Téléphone', 'Date'];
        const rowArrays = rows.map((r) => columns.map((c) => r[c]));
        const pdf = await pdfService.generateReportPDF(`Origine des réservations — ${period}`, rowArrays, columns);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="booking-sources-${period}.pdf"`);
        return res.send(pdf);
      }
    }

    return fail(res, `Unknown report type: ${type}`, 400);
  } catch (err) { next(err); }
};

module.exports = { revenue, utilization, reservationAnalytics, bookingSources, exportReport };
