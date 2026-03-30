const cron = require('node-cron');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

const autoActivateReservations = async () => {
  const now = new Date();
  const result = await prisma.reservations.updateMany({
    where: {
      status: 'CONFIRMED',
      pickup_date: { lte: now },
    },
    data: { status: 'ACTIVE' },
  });

  if (result.count > 0) {
    const activated = await prisma.reservations.findMany({
      where: { status: 'ACTIVE', pickup_date: { lte: now } },
      select: { car_id: true },
    });
    const carIds = [...new Set(activated.map((r) => r.car_id))];
    await prisma.cars.updateMany({
      where: { id: { in: carIds } },
      data: { status: 'RENTED' },
    });
    logger.info(`[cron] Activated ${result.count} reservations, updated ${carIds.length} cars to RENTED`);
  }
};

const updateInsuranceStatuses = async () => {
  const now = new Date();
  const result = await prisma.insurance_policies.updateMany({
    where: { expiry_date: { lt: now }, status: 'active' },
    data: { status: 'expired' },
  });
  if (result.count > 0) {
    logger.info(`[cron] Marked ${result.count} insurance policies as expired`);
  }
};

const runAllJobs = async () => {
  logger.info('[cron] Running scheduled jobs...');
  await autoActivateReservations();
  await updateInsuranceStatuses();
  logger.info('[cron] All jobs completed');
};

const initCronJobs = () => {
  // Every day at 00:05
  cron.schedule('5 0 * * *', () => {
    runAllJobs().catch((err) => logger.error(`[cron] Job failed: ${err.message}`));
  });
  logger.info('[cron] Scheduled jobs initialized');
};

module.exports = { initCronJobs, runAllJobs };
