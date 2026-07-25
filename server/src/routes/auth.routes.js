const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/auth.controller');
const auth = require('../middleware/auth');
const { validateLogin } = require('../middleware/validate');

// POST /api/auth/login - Login user
router.post('/login', validateLogin, login);

// GET /api/auth/me - Get current user
router.get('/me', auth, getMe);

module.exports = router;
