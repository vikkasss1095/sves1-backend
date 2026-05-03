const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// ================= AUTH ROUTES =================

// 🔐 Register
router.post("/register", authController.register);

// 🔐 Login
router.post("/login", authController.login);

// 👤 Get Logged-in User
router.get("/me", authController.getMe);

// 🔑 Change Password (Logged-in)
router.put("/change-password", authController.changePassword);

// ================= FORGOT PASSWORD (OTP FLOW) =================

// 📧 Send OTP (Email)
router.post("/forgot-password/send-otp", authController.sendOtp);

// ✅ Verify OTP
router.post("/forgot-password/verify-otp", authController.verifyOtp);

// 🔄 Reset Password
router.post("/forgot-password/reset-password", authController.resetPassword);

module.exports = router;git add .