const router = require('express').Router();
const { login, refresh, logout, me } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { loginRules } = require('../validators/auth.validators');
const { authLimiter } = require('../config/rateLimiter');

router.post('/login', authLimiter, loginRules, validate, login);
router.post('/refresh', authLimiter, refresh);
router.post('/logout', authLimiter, logout);
router.get('/me', authenticate, me);

module.exports = router;
