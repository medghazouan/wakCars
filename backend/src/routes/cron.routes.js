const router = require('express').Router();
const { trigger } = require('../controllers/cron.controller');

router.post('/run-jobs', trigger);

module.exports = router;
