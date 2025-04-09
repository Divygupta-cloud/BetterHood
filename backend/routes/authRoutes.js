const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new user or authority
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login and get JWT token
router.post('/login', authController.login);

module.exports = router;
