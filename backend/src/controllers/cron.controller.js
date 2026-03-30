const { runAllJobs } = require('../services/cron.service');
const { success, unauthorized } = require('../utils/apiResponse');
const env = require('../config/env');

const trigger = async (req, res, next) => {
  try {
    const token = req.headers['x-cron-secret'];
    if (!token || token !== env.CRON_SECRET) {
      return unauthorized(res, 'Invalid cron secret');
    }
    await runAllJobs();
    return success(res, { message: 'Cron jobs completed successfully' });
  } catch (err) { next(err); }
};

module.exports = { trigger };
