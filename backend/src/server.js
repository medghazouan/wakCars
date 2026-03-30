require('dotenv').config();
const env = require('./config/env');
const logger = require('./utils/logger');

if (env.SENTRY_DSN) {
  const Sentry = require('@sentry/node');
  Sentry.init({ dsn: env.SENTRY_DSN, environment: env.NODE_ENV });
  logger.info('Sentry initialized');
}

const app = require('./app');
const prisma = require('./utils/prisma');
const { initCronJobs } = require('./services/cron.service');

const start = async () => {
  await prisma.$connect();
  logger.info('Database connected');

  initCronJobs();

  app.listen(env.PORT, () => {
    logger.info(`Wak Cars API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
};

start().catch((err) => {
  logger.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
});
