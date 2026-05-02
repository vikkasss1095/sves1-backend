const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  changePassword,
  sendOtp,
  verifyOtp,
  resetPassword
} = require('../controllers/authController');

// ================= ROUTES =================

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// 🔥 SEND OTP
router.post('/send-otp', sendOtp);

// 🔥 VERIFY OTP
router.post('/verify-otp', verifyOtp);

// Reset Password
router.post('/reset-password', resetPassword);

// Profile
router.get('/me', getMe);

// Change Password
router.put('/change-password', changePassword);

module.exports = router;