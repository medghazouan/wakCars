const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const corsOptions = require('./config/cors');
const { adminLimiter } = require('./config/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const authRoutes = require('./routes/auth.routes');
const categoriesRoutes = require('./routes/categories.routes');
const locationsRoutes = require('./routes/locations.routes');
const carsRoutes = require('./routes/cars.routes');
const customersRoutes = require('./routes/customers.routes');
const reservationsRoutes = require('./routes/reservations.routes');
const paymentsRoutes = require('./routes/payments.routes');
const insuranceRoutes = require('./routes/insurance.routes');
const technicalVisitsRoutes = require('./routes/technicalVisits.routes');
const damagesRoutes = require('./routes/damages.routes');
const blogRoutes = require('./routes/blog.routes');
const faqsRoutes = require('./routes/faqs.routes');
const settingsRoutes = require('./routes/settings.routes');
const alertsRoutes = require('./routes/alerts.routes');
const reportsRoutes = require('./routes/reports.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const cronRoutes = require('./routes/cron.routes');
const publicRoutes = require('./routes/public.routes');
const { publicLimiter } = require('./config/rateLimiter');

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/public', publicLimiter, publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', adminLimiter, categoriesRoutes);
app.use('/api/locations', adminLimiter, locationsRoutes);
app.use('/api/cars', adminLimiter, carsRoutes);
app.use('/api/customers', adminLimiter, customersRoutes);
app.use('/api/reservations', adminLimiter, reservationsRoutes);
app.use('/api/payments', adminLimiter, paymentsRoutes);
app.use('/api/insurance', adminLimiter, insuranceRoutes);
app.use('/api/technical-visits', adminLimiter, technicalVisitsRoutes);
app.use('/api/damages', adminLimiter, damagesRoutes);
app.use('/api/blog', adminLimiter, blogRoutes);
app.use('/api/faqs', adminLimiter, faqsRoutes);
app.use('/api/settings', adminLimiter, settingsRoutes);
app.use('/api/alerts', adminLimiter, alertsRoutes);
app.use('/api/reports', adminLimiter, reportsRoutes);
app.use('/api/dashboard', adminLimiter, dashboardRoutes);
app.use('/api/cron', cronRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

app.use((_req, res) => res.status(404).json({ success: false, error: 'Route not found' }));
app.use(errorHandler);

module.exports = app;
