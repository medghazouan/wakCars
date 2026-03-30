const prisma = require('../utils/prisma');
const { success, created, noContent, notFound, fail } = require('../utils/apiResponse');

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
    const { name_fr, name_ar, slug, address_fr, address_ar, city = 'Marrakech' } = req.body;
    const location = await prisma.locations.create({ data: { name_fr, name_ar, slug, address_fr, address_ar, city } });
    return created(res, location);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const exists = await prisma.locations.findUnique({ where: { id } });
    if (!exists) return notFound(res, 'Location');

    const { name_fr, name_ar, slug, address_fr, address_ar, city } = req.body;
    const data = {};
    if (name_fr !== undefined) data.name_fr = name_fr;
    if (name_ar !== undefined) data.name_ar = name_ar;
    if (slug !== undefined) data.slug = slug;
    if (address_fr !== undefined) data.address_fr = address_fr;
    if (address_ar !== undefined) data.address_ar = address_ar;
    if (city !== undefined) data.city = city;

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

module.exports = { list, getById, create, update, remove };
