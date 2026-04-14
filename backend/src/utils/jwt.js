const jwt = require('jsonwebtoken');
const env = require('../config/env');

const JWT_ISSUER = 'wakcars-api';
const JWT_AUDIENCE = 'wakcars-admin';

const signAccess = (payload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN, issuer: JWT_ISSUER, audience: JWT_AUDIENCE });

const signRefresh = (payload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN, issuer: JWT_ISSUER, audience: JWT_AUDIENCE });

const verifyAccess = (token) => jwt.verify(token, env.JWT_SECRET, { issuer: JWT_ISSUER, audience: JWT_AUDIENCE });

const verifyRefresh = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET, { issuer: JWT_ISSUER, audience: JWT_AUDIENCE });

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh };
