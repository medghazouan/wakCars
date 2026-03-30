const prisma = require('../utils/prisma');
const { success, created, notFound, fail } = require('../utils/apiResponse');

const list = async (req, res, next) => {
  try {
    const settings = await prisma.site_settings.findMany({ orderBy: { settingKey: 'asc' } });
    const obj = Object.fromEntries(settings.map((s) => [s.settingKey, { value_fr: s.value_fr, value_ar: s.value_ar }]));
    return success(res, obj);
  } catch (err) { next(err); }
};

const getByKey = async (req, res, next) => {
  try {
    const setting = await prisma.site_settings.findUnique({ where: { settingKey: req.params.key } });
    if (!setting) return notFound(res, 'Setting');
    return success(res, setting);
  } catch (err) { next(err); }
};

const updateByKey = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value_fr, value_ar, description } = req.body;
    const data = {};
    if (value_fr !== undefined) data.value_fr = value_fr;
    if (value_ar !== undefined) data.value_ar = value_ar;
    if (description !== undefined) data.description = description;

    const exists = await prisma.site_settings.findUnique({ where: { settingKey: key } });
    if (!exists) return notFound(res, 'Setting');

    const setting = await prisma.site_settings.update({ where: { settingKey: key }, data });
    return success(res, setting);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { key, value_fr, value_ar, description } = req.body;
    const exists = await prisma.site_settings.findUnique({ where: { settingKey: key } });
    if (exists) return fail(res, `Setting key '${key}' already exists`, 409);

    const setting = await prisma.site_settings.create({
      data: { settingKey: key, value_fr, value_ar, description },
    });
    return created(res, setting);
  } catch (err) { next(err); }
};

module.exports = { list, getByKey, updateByKey, create };
