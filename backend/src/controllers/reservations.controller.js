const prisma = require('../utils/prisma');
const emailService = require('../services/email.service');
const { success, created, notFound, fail } = require('../utils/apiResponse');

const FULL_INCLUDE = {
  car: { include: { images: { where: { is_primary: true }, take: 1 } } },
  customer: true,
  pickup_location: true,
  dropoff_location: true,
  payments: { orderBy: { created_at: 'asc' } },
  damage_reports: { include: { images: true }, orderBy: { created_at: 'desc' } },
};

const calcDays = (pickup, dropoff) =>
  Math.max(1, Math.ceil((new Date(dropoff) - new Date(pickup)) / (1000 * 60 * 60 * 24)));

const computeTotal = async (carId, pickupDate, dropoffDate, hasGps, hasChildSeat) => {
  const car = await prisma.cars.findUnique({ where: { id: carId } });
  if (!car) throw Object.assign(new Error('Car not found'), { status: 404 });

  const gpsSetting = await prisma.site_settings.findUnique({ where: { settingKey: 'gps_daily_price' } });
  const seatSetting = await prisma.site_settings.findUnique({ where: { settingKey: 'child_seat_daily_price' } });

  const days = calcDays(pickupDate, dropoffDate);
  const gpsPrice = hasGps ? days * parseFloat(gpsSetting?.value_fr || '50') : 0;
  const seatPrice = hasChildSeat ? days * parseFloat(seatSetting?.value_fr || '30') : 0;
  return Number(car.price_per_day) * days + gpsPrice + seatPrice;
};

const list = async (req, res, next) => {
  try {
    const { status, payment_status, car_id, customer_id, from, to, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (payment_status) where.payment_status = payment_status;
    if (car_id) where.car_id = parseInt(car_id);
    if (customer_id) where.customer_id = parseInt(customer_id);
    if (from || to) {
      where.pickup_date = {};
      if (from) where.pickup_date.gte = new Date(from);
      if (to) where.pickup_date.lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [reservations, total] = await Promise.all([
      prisma.reservations.findMany({
        where,
        include: {
          car: {
            select: {
              id: true,
              brand: true,
              model: true,
              year: true,
              license_plate: true,
              category: { select: { name_fr: true } },
              images: { orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }], take: 1 },
            },
          },
          customer: { select: { id: true, first_name: true, last_name: true, phone: true } },
          pickup_location: { select: { id: true, name_fr: true } },
          dropoff_location: { select: { id: true, name_fr: true } },
          _count: { select: { payments: true } },
        },
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
      }),
      prisma.reservations.count({ where }),
    ]);
    return success(res, reservations, 200, { total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const reservation = await prisma.reservations.findUnique({
      where: { id: parseInt(req.params.id) },
      include: FULL_INCLUDE,
    });
    if (!reservation) return notFound(res, 'Reservation');
    return success(res, reservation);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const {
      car_id, customer_id, pickup_location_id, dropoff_location_id,
      pickup_date, dropoff_date, has_gps = false, has_child_seat = false, status = 'PENDING',
    } = req.body;

    const carIdInt = parseInt(car_id);
    const car = await prisma.cars.findUnique({ where: { id: carIdInt } });
    if (!car) return notFound(res, 'Car');
    if (car.status !== 'AVAILABLE') return fail(res, 'Car is not available for reservation', 409);

    const overlap = await prisma.reservations.findFirst({
      where: {
        car_id: carIdInt,
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        AND: [{ pickup_date: { lte: new Date(dropoff_date) } }, { dropoff_date: { gte: new Date(pickup_date) } }],
      },
    });
    if (overlap) return fail(res, 'Car already has a reservation in this period', 409);

    const total_amount = await computeTotal(carIdInt, pickup_date, dropoff_date, has_gps, has_child_seat);

    const reservation = await prisma.reservations.create({
      data: {
        car_id: carIdInt,
        customer_id: customer_id ? parseInt(customer_id) : undefined,
        pickup_location_id: parseInt(pickup_location_id),
        dropoff_location_id: parseInt(dropoff_location_id),
        pickup_date: new Date(pickup_date),
        dropoff_date: new Date(dropoff_date),
        has_gps: Boolean(has_gps),
        has_child_seat: Boolean(has_child_seat),
        total_amount,
        status,
      },
      include: FULL_INCLUDE,
    });

    return created(res, reservation);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await prisma.reservations.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'Reservation');

    const { pickup_date, dropoff_date, has_gps, has_child_seat, pickup_location_id, dropoff_location_id } = req.body;
    const data = {};

    if (pickup_date) data.pickup_date = new Date(pickup_date);
    if (dropoff_date) data.dropoff_date = new Date(dropoff_date);
    if (has_gps !== undefined) data.has_gps = Boolean(has_gps);
    if (has_child_seat !== undefined) data.has_child_seat = Boolean(has_child_seat);
    if (pickup_location_id) data.pickup_location_id = parseInt(pickup_location_id);
    if (dropoff_location_id) data.dropoff_location_id = parseInt(dropoff_location_id);

    if ((pickup_date || dropoff_date || has_gps !== undefined || has_child_seat !== undefined)) {
      const pd = data.pickup_date || exists.pickup_date;
      const dd = data.dropoff_date || exists.dropoff_date;
      const gps = data.has_gps !== undefined ? data.has_gps : exists.has_gps;
      const seat = data.has_child_seat !== undefined ? data.has_child_seat : exists.has_child_seat;
      data.total_amount = await computeTotal(exists.car_id, pd, dd, gps, seat);
    }

    const reservation = await prisma.reservations.update({ where: { id }, data, include: FULL_INCLUDE });
    return success(res, reservation);
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const reservation = await prisma.reservations.findUnique({ where: { id }, include: { car: true, customer: true } });
    if (!reservation) return notFound(res, 'Reservation');

    const data = { status };

    if (status === 'CONFIRMED') {
      data.confirmed_at = new Date();
      if (reservation.customer?.email) {
        const full = await prisma.reservations.findUnique({ where: { id }, include: FULL_INCLUDE });
        emailService.sendReservationConfirmation(full).catch(() => {});
      }
    }
    if (status === 'ACTIVE') {
      await prisma.cars.update({ where: { id: reservation.car_id }, data: { status: 'RENTED' } });
    }
    if (status === 'COMPLETED') {
      data.actual_return_date = new Date();
      await prisma.cars.update({ where: { id: reservation.car_id }, data: { status: 'AVAILABLE' } });
    }
    if (status === 'CANCELLED' || status === 'NO_SHOW') {
      if (reservation.status === 'ACTIVE') {
        await prisma.cars.update({ where: { id: reservation.car_id }, data: { status: 'AVAILABLE' } });
      }
    }

    const updated = await prisma.reservations.update({ where: { id }, data, include: FULL_INCLUDE });
    return success(res, updated);
  } catch (err) { next(err); }
};

const reassign = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const newCarId = parseInt(req.body.car_id);

    const reservation = await prisma.reservations.findUnique({ where: { id } });
    if (!reservation) return notFound(res, 'Reservation');

    const newCar = await prisma.cars.findUnique({ where: { id: newCarId } });
    if (!newCar) return notFound(res, 'New car');
    if (newCar.status !== 'AVAILABLE') return fail(res, 'New car is not available', 409);

    if (reservation.status === 'ACTIVE') {
      await prisma.cars.update({ where: { id: reservation.car_id }, data: { status: 'AVAILABLE' } });
      await prisma.cars.update({ where: { id: newCarId }, data: { status: 'RENTED' } });
    }

    const total_amount = await computeTotal(
      newCarId, reservation.pickup_date, reservation.dropoff_date,
      reservation.has_gps, reservation.has_child_seat
    );
    const updated = await prisma.reservations.update({
      where: { id },
      data: { car_id: newCarId, total_amount },
      include: FULL_INCLUDE,
    });
    return success(res, updated);
  } catch (err) { next(err); }
};

const updatePaymentStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { payment_status } = req.body;
    const exists = await prisma.reservations.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'Reservation');

    const updated = await prisma.reservations.update({
      where: { id },
      data: { payment_status },
      include: {
        car: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            license_plate: true,
            category: { select: { name_fr: true } },
            images: { orderBy: [{ is_primary: 'desc' }, { sort_order: 'asc' }], take: 1 },
          },
        },
        customer: { select: { id: true, first_name: true, last_name: true, phone: true } },
        pickup_location: { select: { id: true, name_fr: true } },
        dropoff_location: { select: { id: true, name_fr: true } },
        _count: { select: { payments: true } },
      },
    });
    return success(res, updated);
  } catch (err) {
    next(err);
  }
};

const confirm = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const reservation = await prisma.reservations.findUnique({ where: { id }, include: FULL_INCLUDE });
    if (!reservation) return notFound(res, 'Reservation');
    if (reservation.status !== 'PENDING') {
      return fail(res, `Cannot confirm a reservation with status ${reservation.status}`, 409);
    }
    const updated = await prisma.reservations.update({
      where: { id },
      data: { status: 'CONFIRMED', confirmed_at: new Date() },
      include: FULL_INCLUDE,
    });
    if (reservation.customer?.email) {
      emailService.sendReservationConfirmation(updated).catch(() => {});
    }
    return success(res, updated);
  } catch (err) { next(err); }
};

module.exports = {
  list,
  getById,
  create,
  update,
  updateStatus,
  updatePaymentStatus,
  reassign,
  confirm,
};
