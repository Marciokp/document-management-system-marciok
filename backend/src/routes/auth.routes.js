const express = require('express');
const authController = require('../controllers/auth.controller');
const authRateLimit = require('../middleware/auth-rate-limit.middleware');

const router = express.Router();

router.post('/register', authRateLimit, authController.register);
router.post('/login', authRateLimit, authController.login);
router.get('/me', authController.currentUser);
router.post('/logout', authController.logout);

module.exports = router;
