const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* ================= TOKEN ================= */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "7d",
  });

/* ================= REGISTER ================= */
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({
      email: email.toLowerCase(),
    });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
    });

    res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user._id),
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= LOGIN ================= */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      token: generateToken(user._id),
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET PROFILE ================= */
const getMe = async (req, res) => {
  try {
    res.json({
      message: "User fetched",
      user: req.user || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= CHANGE PASSWORD ================= */
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= OTP STORE (TEMP MEMORY) ================= */
const otpStore = {};

/* ================= SEND OTP ================= */
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[phone] = {
      otp,
      expire: Date.now() + 5 * 60 * 1000,
    };

    res.json({
      message: "OTP sent successfully",
      otp, // 🔥 frontend में दिखेगा
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= VERIFY OTP ================= */
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const data = otpStore[phone];

    if (!data || data.otp !== otp || data.expire < Date.now()) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    res.json({ message: "OTP verified" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= RESET PASSWORD ================= */
const resetPassword = async (req, res) => {
  try {
    const { phone, newPassword } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    delete otpStore[phone];

    res.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= EXPORT ================= */
module.exports = {
  register,
  login,
  getMe,
  changePassword,
  sendOtp,
  verifyOtp,
  resetPassword,
};