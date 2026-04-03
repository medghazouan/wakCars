const { Prisma } = require('@prisma/client');
const prisma = require('../utils/prisma');
const cloudinary = require('../services/cloudinary.service');
const { success, created, noContent, notFound, fail } = require('../utils/apiResponse');

function parseImagesField(images) {
  if (images === undefined || images === null) return null;
  if (Array.isArray(images)) {
    return images.filter((u) => typeof u === 'string' && u.trim().length > 0);
  }
  if (typeof images === 'string') {
    try {
      const j = JSON.parse(images);
      return Array.isArray(j) ? j.filter((u) => typeof u === 'string' && u.trim().length > 0) : [];
    } catch {
      return [];
    }
  }
  return [];
}

const list = async (req, res, next) => {
  try {
    const locations = await prisma.locations.findMany({ orderBy: { name_fr: 'asc' } });
    return success(res, locations);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const location = await prisma.locations.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!location) return notFound(res, 'Location');
    return success(res, location);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { name_fr, name_ar, slug, address_fr, address_ar, city = 'Marrakech', images } = req.body;
    const data = { name_fr, name_ar, slug, address_fr, address_ar, city };
    const parsed = parseImagesField(images);
    if (parsed !== null && parsed.length > 0) data.images = parsed;
    const location = await prisma.locations.create({ data });
    return created(res, location);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await prisma.locations.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'Location');

    const { name_fr, name_ar, slug, address_fr, address_ar, city, images } = req.body;
    const data = {};
    if (name_fr !== undefined) data.name_fr = name_fr;
    if (name_ar !== undefined) data.name_ar = name_ar;
    if (slug !== undefined) data.slug = slug;
    if (address_fr !== undefined) data.address_fr = address_fr;
    if (address_ar !== undefined) data.address_ar = address_ar;
    if (city !== undefined) data.city = city;
    if (images !== undefined) {
      const parsed = parseImagesField(images);
      data.images = parsed !== null && parsed.length > 0 ? parsed : Prisma.DbNull;
    }

    const location = await prisma.locations.update({ where: { id }, data });
    return success(res, location);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await prisma.locations.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'Location');

    const refCount = await prisma.reservations.count({
      where: { OR: [{ pickup_location_id: id }, { dropoff_location_id: id }] },
    });
    if (refCount > 0) {
      return fail(res, `Cannot delete: ${refCount} reservation(s) reference this location`, 409);
    }
    await prisma.locations.delete({ where: { id } });
    return noContent(res);
  } catch (err) { next(err); }
};

const addImage = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await prisma.locations.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'Location');
    if (!req.file?.buffer) return fail(res, 'Image file required', 400);

    const { url } = await cloudinary.uploadImage(req.file.buffer, 'locations');
    const prev = parseImagesField(exists.images) || [];
    const location = await prisma.locations.update({
      where: { id },
      data: { images: [...prev, url] },
    });
    return success(res, location);
  } catch (err) { next(err); }
};

const removeImage = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { url } = req.body;
    const exists = await prisma.locations.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'Location');
    if (!url || typeof url !== 'string') return fail(res, 'url is required', 400);

    const prev = parseImagesField(exists.images) || [];
    const nextUrls = prev.filter((u) => u !== url.trim());
    const location = await prisma.locations.update({
      where: { id },
      data: { images: nextUrls.length > 0 ? nextUrls : Prisma.DbNull },
    });
    return success(res, location);
  } catch (err) { next(err); }
};

module.exports = { list, getById, create, update, remove, addImage, removeImage };
