require('dotenv').config();

const required = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

const optional = (key, fallback = '') => process.env[key] || fallback;

module.exports = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '3000'), 10),
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
  JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '15m'),
  JWT_REFRESH_EXPIRES_IN: optional('JWT_REFRESH_EXPIRES_IN', '7d'),
  CORS_ORIGIN: optional('CORS_ORIGIN', 'http://localhost:5173'),
  /** Refresh cookie SameSite: use `none` when the admin UI is on a different origin than the API (e.g. Vercel + Hostinger). Requires HTTPS. */
  COOKIE_SAMESITE: optional('COOKIE_SAMESITE', process.env.NODE_ENV === 'production' ? 'none' : 'lax'),
  CLOUDINARY_CLOUD_NAME: required('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: required('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: required('CLOUDINARY_API_SECRET'),
  RESEND_SMTP_HOST: optional('RESEND_SMTP_HOST', 'smtp.resend.com'),
  RESEND_SMTP_PORT: parseInt(optional('RESEND_SMTP_PORT', '465'), 10),
  RESEND_SMTP_USER: optional('RESEND_SMTP_USER', 'resend'),
  RESEND_API_KEY: optional('RESEND_API_KEY'),
  EMAIL_FROM: optional('EMAIL_FROM', 'noreply@wakcars.ma'),
  EMAIL_FROM_NAME: optional('EMAIL_FROM_NAME', 'Wak Cars'),
  SENTRY_DSN: optional('SENTRY_DSN'),
  CRON_SECRET: optional('CRON_SECRET'),
  WHATSAPP_BUSINESS_PHONE: optional('WHATSAPP_BUSINESS_PHONE', '+212661234567'),
};
