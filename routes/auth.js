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

const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);

// 🔥 NEW ROUTES
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;