const express = require('express');
const router = express.Router();

// ✅ CONTROLLER IMPORT (सबसे important)
const {
  register,
  login,
  getMe,
  changePassword,
  sendOtp,
  verifyOtp,
  resetPassword
} = require('../controllers/authController');

// ================= AUTH ROUTES =================

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// OTP FLOW
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// Profile
router.get('/me', getMe);

// Change Password
router.put('/change-password', changePassword);

module.exports = router;