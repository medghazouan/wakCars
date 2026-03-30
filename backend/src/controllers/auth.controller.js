const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { signAccess, signRefresh, verifyRefresh } = require('../utils/jwt');
const { success, fail, unauthorized } = require('../utils/apiResponse');
const logger = require('../utils/logger');

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.admins.findUnique({ where: { email } });
    if (!admin || !admin.is_active) {
      return unauthorized(res, 'Invalid credentials');
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return unauthorized(res, 'Invalid credentials');

    const payload = { id: admin.id, role: admin.role };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);
    const refreshHash = await bcrypt.hash(refreshToken, 10);

    await prisma.admins.update({
      where: { id: admin.id },
      data: { refresh_token: refreshHash, last_login_at: new Date() },
    });

    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);

    logger.info(`Admin login: ${admin.email}`);
    return success(res, {
      accessToken,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return unauthorized(res, 'Refresh token required');

    let payload;
    try {
      payload = verifyRefresh(token);
    } catch {
      return unauthorized(res, 'Invalid or expired refresh token');
    }

    const admin = await prisma.admins.findUnique({ where: { id: payload.id } });
    if (!admin || !admin.is_active || !admin.refresh_token) {
      return unauthorized(res, 'Session expired');
    }

    const valid = await bcrypt.compare(token, admin.refresh_token);
    if (!valid) return unauthorized(res, 'Invalid refresh token');

    const newPayload = { id: admin.id, role: admin.role };
    const accessToken = signAccess(newPayload);
    const newRefreshToken = signRefresh(newPayload);
    const newHash = await bcrypt.hash(newRefreshToken, 10);

    await prisma.admins.update({
      where: { id: admin.id },
      data: { refresh_token: newHash },
    });

    res.cookie('refreshToken', newRefreshToken, COOKIE_OPTS);
    return success(res, { accessToken });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      try {
        const payload = verifyRefresh(token);
        await prisma.admins.update({
          where: { id: payload.id },
          data: { refresh_token: null },
        });
      } catch {
        // Token invalid — still clear cookie
      }
    }
    res.clearCookie('refreshToken');
    return success(res, { message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const admin = await prisma.admins.findUnique({
      where: { id: req.admin.id },
      select: { id: true, name: true, email: true, role: true, last_login_at: true, created_at: true },
    });
    if (!admin) return fail(res, 'Admin not found', 404);
    return success(res, admin);
  } catch (err) {
    next(err);
  }
};

module.exports = { login, refresh, logout, me };
