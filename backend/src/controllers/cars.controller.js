const prisma = require('../utils/prisma');
const cloudinary = require('../services/cloudinary.service');
const { success, created, noContent, notFound, fail } = require('../utils/apiResponse');

function slugifySegment(value) {
  if (value === undefined || value === null || value === '') return '';
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function resolveCarSlug({ slug: slugInput, brand, model, year, license_plate }) {
  let base = slugInput && String(slugInput).trim();
  if (base) {
    base = slugifySegment(base);
  }
  if (!base) {
    const parts = [brand, model, year, license_plate].map(slugifySegment).filter(Boolean);
    base = parts.join('-') || `car-${Date.now()}`;
  }
  base = base.slice(0, 140);
  let candidate = base;
  for (let n = 0; n < 500; n += 1) {
    const existing = await prisma.cars.findUnique({ where: { slug: candidate } });
    if (!existing) return candidate.slice(0, 150);
    const suffix = `-${n + 1}`;
    candidate = `${base.slice(0, 150 - suffix.length)}${suffix}`;
  }
  return `${base.slice(0, 120)}-${Date.now()}`.slice(0, 150);
}

const PRIMARY_IMAGE_INCLUDE = { images: { where: { is_primary: true }, take: 1 } };
const FULL_INCLUDE = {
  category: { select: { id: true, name_fr: true, name_ar: true, slug: true } },
  images: { orderBy: { sort_order: 'asc' } },
  insurance_policies: { orderBy: { expiry_date: 'asc' } },
  technical_visits: { orderBy: { visit_date: 'desc' }, take: 5 },
  damage_reports: { orderBy: { created_at: 'desc' }, take: 10, include: { images: true } },
};

const list = async (req, res, next) => {
  try {
    const { status, category_id, fuel_type, transmission, is_featured, is_active, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (category_id) where.category_id = parseInt(category_id);
    if (fuel_type) where.fuel_type = fuel_type;
    if (transmission) where.transmission = transmission;
    if (is_featured !== undefined) where.is_featured = is_featured === 'true' || is_featured === '1';
    if (is_active !== undefined) where.is_active = is_active === 'false' || is_active === '0' ? false : true;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [cars, total] = await Promise.all([
      prisma.cars.findMany({
        where,
        include: {
          category: { select: { id: true, name_fr: true, name_ar: true } },
          ...PRIMARY_IMAGE_INCLUDE,
        },
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
      }),
      prisma.cars.count({ where }),
    ]);
    return success(res, cars, 200, { total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const car = await prisma.cars.findUnique({
      where: { id: parseInt(req.params.id) },
      include: FULL_INCLUDE,
    });
    if (!car) return notFound(res, 'Car');
    return success(res, car);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const {
      brand, model, slug, year, license_plate, status = 'AVAILABLE',
      transmission = 'MANUAL', fuel_type = 'DIESEL', seats = 5, doors = 4,
      price_per_day, deposit_amount, description_fr, description_ar,
      is_active = true, is_featured = false, category_id,
    } = req.body;

    const resolvedSlug = await resolveCarSlug({
      slug,
      brand,
      model,
      year,
      license_plate,
    });

    const car = await prisma.cars.create({
      data: {
        brand, model, slug: resolvedSlug, year: parseInt(year), license_plate, status,
        transmission, fuel_type, seats: parseInt(seats), doors: parseInt(doors),
        price_per_day: parseFloat(price_per_day),
        deposit_amount: parseFloat(deposit_amount),
        description_fr, description_ar,
        is_active: Boolean(is_active),
        is_featured: Boolean(is_featured),
        category_id: parseInt(category_id),
      },
    });

    if (req.files && req.files.length > 0) {
      await Promise.all(
        req.files.map(async (file, idx) => {
          const { url, public_id } = await cloudinary.uploadImage(file.buffer, 'cars');
          return prisma.car_images.create({
            data: { car_id: car.id, url, public_id, is_primary: idx === 0, sort_order: idx },
          });
        })
      );
    }

    const full = await prisma.cars.findUnique({ where: { id: car.id }, include: FULL_INCLUDE });
    return created(res, full);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await prisma.cars.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'Car');

    const allowed = [
      'brand', 'model', 'slug', 'year', 'license_plate', 'status', 'transmission',
      'fuel_type', 'seats', 'doors', 'price_per_day', 'deposit_amount',
      'description_fr', 'description_ar', 'is_active', 'is_featured', 'category_id',
    ];
    const data = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        if (['year', 'seats', 'doors', 'category_id'].includes(key)) data[key] = parseInt(req.body[key]);
        else if (['price_per_day', 'deposit_amount'].includes(key)) data[key] = parseFloat(req.body[key]);
        else if (['is_active', 'is_featured'].includes(key)) data[key] = Boolean(req.body[key]);
        else data[key] = req.body[key];
      }
    });

    const car = await prisma.cars.update({ where: { id }, data, include: FULL_INCLUDE });
    return success(res, car);
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const exists = await prisma.cars.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'Car');
    const car = await prisma.cars.update({ where: { id }, data: { status } });
    return success(res, car);
  } catch (err) { next(err); }
};

const softDelete = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await prisma.cars.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'Car');
    await prisma.cars.update({ where: { id }, data: { is_active: false } });
    return noContent(res);
  } catch (err) { next(err); }
};

const addImage = async (req, res, next) => {
  try {
    const car_id = parseInt(req.params.id);
    const exists = await prisma.cars.findUnique({ where: { id: car_id } });
    if (!exists) return notFound(res, 'Car');
    if (!req.file) return fail(res, 'Image file is required', 400);

    const { url, public_id } = await cloudinary.uploadImage(req.file.buffer, 'cars');
    const hasPrimary = await prisma.car_images.count({ where: { car_id, is_primary: true } });
    const maxSort = await prisma.car_images.findFirst({ where: { car_id }, orderBy: { sort_order: 'desc' } });

    const image = await prisma.car_images.create({
      data: {
        car_id, url, public_id,
        alt_fr: req.body.alt_fr,
        alt_ar: req.body.alt_ar,
        is_primary: hasPrimary === 0,
        sort_order: maxSort ? maxSort.sort_order + 1 : 0,
      },
    });
    return created(res, image);
  } catch (err) { next(err); }
};

const deleteImage = async (req, res, next) => {
  try {
    const car_id = parseInt(req.params.id);
    const id = parseInt(req.params.imageId);
    const image = await prisma.car_images.findFirst({ where: { id, car_id } });
    if (!image) return notFound(res, 'Image');

    await cloudinary.deleteImage(image.public_id);
    await prisma.car_images.delete({ where: { id } });

    if (image.is_primary) {
      const next = await prisma.car_images.findFirst({ where: { car_id }, orderBy: { sort_order: 'asc' } });
      if (next) await prisma.car_images.update({ where: { id: next.id }, data: { is_primary: true } });
    }
    return noContent(res);
  } catch (err) { next(err); }
};

const setPrimaryImage = async (req, res, next) => {
  try {
    const car_id = parseInt(req.params.id);
    const id = parseInt(req.params.imageId);
    const image = await prisma.car_images.findFirst({ where: { id, car_id } });
    if (!image) return notFound(res, 'Image');

    await prisma.car_images.updateMany({ where: { car_id }, data: { is_primary: false } });
    const updated = await prisma.car_images.update({ where: { id }, data: { is_primary: true } });
    return success(res, updated);
  } catch (err) { next(err); }
};

module.exports = { list, getById, create, update, updateStatus, softDelete, addImage, deleteImage, setPrimaryImage };
