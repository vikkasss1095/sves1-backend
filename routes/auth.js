const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  changePassword,
  resetPassword
} = require('../controllers/authController');

const User = require('../models/User');

// ================= ROUTES =================

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// 🔥 CHECK USER (NEW)
router.post('/check-user', async (req, res) => {
  const { phone } = req.body;

  const user = await User.findOne({ phone });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ message: "User exists" });
});

// Reset Password
router.post('/reset-password', resetPassword);

// Profile
router.get('/me', getMe);

// Change Password
router.put('/change-password', changePassword);

module.exports = router;