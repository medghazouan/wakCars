const prisma = require('../utils/prisma');
const cloudinary = require('../services/cloudinary.service');
const emailService = require('../services/email.service');
const { success, created, noContent, notFound, fail } = require('../utils/apiResponse');

const FULL_INCLUDE = {
  car: { select: { id: true, brand: true, model: true, license_plate: true } },
  reservation: { select: { id: true, status: true } },
  reported_by: { select: { id: true, name: true } },
  images: true,
};

const list = async (req, res, next) => {
  try {
    const { car_id, reservation_id, resolved, page = 1, limit = 20 } = req.query;
    const where = {};
    if (car_id) where.car_id = parseInt(car_id);
    if (reservation_id) where.reservation_id = parseInt(reservation_id);
    if (resolved !== undefined) where.resolved = resolved === 'true' || resolved === '1';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [reports, total] = await Promise.all([
      prisma.damage_reports.findMany({
        where,
        include: FULL_INCLUDE,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
      }),
      prisma.damage_reports.count({ where }),
    ]);
    return success(res, reports, 200, { total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const report = await prisma.damage_reports.findUnique({
      where: { id: parseInt(req.params.id) },
      include: FULL_INCLUDE,
    });
    if (!report) return notFound(res, 'Damage report');
    return success(res, report);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { car_id, reservation_id, description, estimated_cost, customer_notified = false } = req.body;

    const report = await prisma.damage_reports.create({
      data: {
        car_id: parseInt(car_id),
        reservation_id: reservation_id ? parseInt(reservation_id) : undefined,
        description,
        estimated_cost: estimated_cost ? parseFloat(estimated_cost) : undefined,
        customer_notified: Boolean(customer_notified),
        reported_by_id: req.admin.id,
      },
    });

    if (req.files && req.files.length > 0) {
      await Promise.all(
        req.files.map(async (file) => {
          const { url, public_id } = await cloudinary.uploadImage(file.buffer, 'damages');
          return prisma.damage_images.create({
            data: { damage_report_id: report.id, url, public_id },
          });
        })
      );
    }

    if (customer_notified && reservation_id) {
      const reservation = await prisma.reservations.findUnique({
        where: { id: parseInt(reservation_id) },
        include: { customer: true },
      });
      if (reservation?.customer?.email) {
        emailService.sendDamageNotification(report, reservation.customer).catch(() => {});
        await prisma.damage_reports.update({ where: { id: report.id }, data: { customer_notified: true } });
      }
    }

    const full = await prisma.damage_reports.findUnique({ where: { id: report.id }, include: FULL_INCLUDE });
    return created(res, full);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await prisma.damage_reports.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'Damage report');

    const { description, estimated_cost, resolved, customer_notified } = req.body;
    const data = {};
    if (description !== undefined) data.description = description;
    if (estimated_cost !== undefined) data.estimated_cost = parseFloat(estimated_cost);
    if (resolved !== undefined) data.resolved = Boolean(resolved);
    if (customer_notified !== undefined) data.customer_notified = Boolean(customer_notified);

    const report = await prisma.damage_reports.update({ where: { id }, data, include: FULL_INCLUDE });
    return success(res, report);
  } catch (err) { next(err); }
};

const addImage = async (req, res, next) => {
  try {
    const damage_report_id = parseInt(req.params.id);
    const exists = await prisma.damage_reports.findUnique({ where: { id: damage_report_id } });
    if (!exists) return notFound(res, 'Damage report');
    if (!req.file) return fail(res, 'Image file required', 400);

    const { url, public_id } = await cloudinary.uploadImage(req.file.buffer, 'damages');
    const image = await prisma.damage_images.create({ data: { damage_report_id, url, public_id } });
    return created(res, image);
  } catch (err) { next(err); }
};

const deleteImage = async (req, res, next) => {
  try {
    const damage_report_id = parseInt(req.params.id);
    const id = parseInt(req.params.imageId);
    const image = await prisma.damage_images.findFirst({ where: { id, damage_report_id } });
    if (!image) return notFound(res, 'Image');

    await cloudinary.deleteImage(image.public_id);
    await prisma.damage_images.delete({ where: { id } });
    return noContent(res);
  } catch (err) { next(err); }
};

const notifyCustomer = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const report = await prisma.damage_reports.findUnique({
      where: { id },
      include: { reservation: { include: { customer: true } } },
    });
    if (!report) return notFound(res, 'Damage report');
    if (!report.reservation?.customer?.email) {
      return fail(res, 'No customer email found for this damage report', 422);
    }

    await emailService.sendDamageNotification(report, report.reservation.customer);
    const updated = await prisma.damage_reports.update({
      where: { id },
      data: { customer_notified: true },
      include: FULL_INCLUDE,
    });
    return success(res, updated);
  } catch (err) { next(err); }
};

module.exports = { list, getById, create, update, addImage, deleteImage, notifyCustomer };
