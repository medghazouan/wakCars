const prisma = require('../utils/prisma');
const { success, created, notFound } = require('../utils/apiResponse');

const syncPaymentStatus = async (reservationId) => {
  const reservation = await prisma.reservations.findUnique({
    where: { id: reservationId },
    include: { payments: true },
  });
  if (!reservation) return;

  const paid = reservation.payments
    .filter((p) => p.status !== 'REFUNDED')
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const total = Number(reservation.total_amount);

  let payment_status = 'UNPAID';
  if (paid >= total) payment_status = 'PAID';
  else if (paid > 0) payment_status = 'PARTIAL';

  await prisma.reservations.update({ where: { id: reservationId }, data: { payment_status } });
};

const list = async (req, res, next) => {
  try {
    const { reservation_id, method, status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (reservation_id) where.reservation_id = parseInt(reservation_id);
    if (method) where.method = method;
    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [payments, total] = await Promise.all([
      prisma.payments.findMany({
        where,
        include: {
          reservation: { select: { id: true, status: true, total_amount: true } },
          recorded_by: { select: { id: true, name: true } },
        },
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
      }),
      prisma.payments.count({ where }),
    ]);
    return success(res, payments, 200, { total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const payment = await prisma.payments.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        reservation: { include: { car: true, customer: true } },
        recorded_by: { select: { id: true, name: true } },
      },
    });
    if (!payment) return notFound(res, 'Payment');
    return success(res, payment);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { reservation_id, amount, method, reference, notes } = req.body;
    const resId = parseInt(reservation_id);

    const reservation = await prisma.reservations.findUnique({ where: { id: resId } });
    if (!reservation) return notFound(res, 'Reservation');

    const payment = await prisma.payments.create({
      data: {
        reservation_id: resId,
        amount: parseFloat(amount),
        method,
        status: 'PAID',
        reference,
        notes,
        recorded_by_id: req.admin.id,
      },
      include: { recorded_by: { select: { id: true, name: true } } },
    });

    await syncPaymentStatus(resId);
    return created(res, payment);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const payment = await prisma.payments.findUnique({ where: { id } });
    if (!payment) return notFound(res, 'Payment');

    const { amount, method, status, reference, notes } = req.body;
    const data = {};
    if (amount !== undefined) data.amount = parseFloat(amount);
    if (method !== undefined) data.method = method;
    if (status !== undefined) data.status = status;
    if (reference !== undefined) data.reference = reference;
    if (notes !== undefined) data.notes = notes;

    const updated = await prisma.payments.update({ where: { id }, data });
    await syncPaymentStatus(payment.reservation_id);
    return success(res, updated);
  } catch (err) { next(err); }
};

module.exports = { list, getById, create, update };
