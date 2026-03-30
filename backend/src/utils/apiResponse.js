const success = (res, data, status = 200, meta = null) => {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
};

const created = (res, data) => success(res, data, 201);

const noContent = (res) => res.status(204).send();

const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, error: message });

const notFound = (res, resource = 'Resource') =>
  fail(res, `${resource} not found`, 404);

const unauthorized = (res, message = 'Unauthorized') =>
  fail(res, message, 401);

const forbidden = (res, message = 'Forbidden') =>
  fail(res, message, 403);

module.exports = { success, created, noContent, fail, notFound, unauthorized, forbidden };
