const logger = require('../utils/logger');

module.exports = (err, req, res, _next) => {
  logger.error(`${req.method} ${req.path} — ${err.message}`, { stack: err.stack });

  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, error: err.message });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ success: false, error: 'A record with this value already exists' });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, error: 'Record not found' });
  }

  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'Internal server error'
      : err.message;

  return res.status(status).json({ success: false, error: message });
};
