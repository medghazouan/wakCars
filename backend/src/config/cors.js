const env = require('./env');

const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);

/** Allow any localhost / 127.0.0.1 port in dev so Vite (5173, 5174, …) never breaks CORS */
function isDevLocalOrigin(origin) {
  if (!origin) return true;
  try {
    const u = new URL(origin);
    const hostOk = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
    const protoOk = u.protocol === 'http:' || u.protocol === 'https:';
    return hostOk && protoOk;
  } catch {
    return false;
  }
}

module.exports = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    if (env.NODE_ENV !== 'production' && isDevLocalOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
