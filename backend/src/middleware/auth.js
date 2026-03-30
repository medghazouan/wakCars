const { verifyAccess } = require('../utils/jwt');
const { unauthorized, forbidden } = require('../utils/apiResponse');

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return unauthorized(res, 'Access token required');
  }
  const token = header.slice(7);
  try {
    req.admin = verifyAccess(token);
    next();
  } catch {
    return unauthorized(res, 'Invalid or expired access token');
  }
};

const requireRole = (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.admin?.role)) {
      return forbidden(res, 'Insufficient permissions');
    }
    next();
  };

module.exports = { authenticate, requireRole };
