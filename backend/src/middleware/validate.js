const { validationResult } = require('express-validator');
const { fail } = require('../utils/apiResponse');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    return fail(res, first.msg, 422);
  }
  next();
};
