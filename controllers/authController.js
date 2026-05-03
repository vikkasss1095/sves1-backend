const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");

/* ================= TOKEN ================= */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "7d",
  });

/* ================= REGISTER ================= */
const register = async (req, res) => {
  try {
    const { name, email, password, phone, companyName, gstNumber } = req.body;

    const cleanEmail = email.toLowerCase().trim();

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email: cleanEmail,
      password,
      phone,
      companyName,
      gstNumber,
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

    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });

    if (!user || !(await user.matchPassword(password))) {
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
  res.json({ user: req.user || null });
};

/* ================= CHANGE PASSWORD ================= */
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!(await user.matchPassword(oldPassword))) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= OTP STORE ================= */
const otpStore = {};

/* ================= MAIL TRANSPORT ================= */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ================= SEND OTP ================= */
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: "Email not registered" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[cleanEmail] = {
      otp,
      expire: Date.now() + 5 * 60 * 1000,
    };

    console.log("OTP:", otp);

    // 🔥 SEND EMAIL
    await transporter.sendMail({
      from: `"SVES Support" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: "Your OTP Code",
      html: `
        <h2>OTP Verification</h2>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes</p>
      `,
    });

    console.log("✅ Mail sent");

    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    console.log("❌ EMAIL ERROR:", error);
    res.status(500).json({ message: "Email send failed" });
  }
};

/* ================= VERIFY OTP ================= */
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const cleanEmail = email.toLowerCase().trim();

    const data = otpStore[cleanEmail];

    if (!data || data.otp !== otp || data.expire < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= RESET PASSWORD ================= */
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword;
    await user.save();

    delete otpStore[cleanEmail];

    res.json({ message: "Password updated successfully" });

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