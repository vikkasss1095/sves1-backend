const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// REGISTER
router.post("/register", authController.register);

// LOGIN
router.post("/login", authController.login);

// 🔥 FIX (IMPORTANT)
router.get("/me", protect, authController.getMe);

// CHANGE PASSWORD
router.put("/change-password", protect, authController.changePassword);

// OTP
router.post("/forgot-password/send-otp", authController.sendOtp);
router.post("/forgot-password/verify-otp", authController.verifyOtp);
router.post("/forgot-password/reset-password", authController.resetPassword);

module.exports = router;