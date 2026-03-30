const jwt = require('jsonwebtoken');
const env = require('../config/env');

const signAccess = (payload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

const signRefresh = (payload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });

const verifyAccess = (token) => jwt.verify(token, env.JWT_SECRET);

const verifyRefresh = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh };
