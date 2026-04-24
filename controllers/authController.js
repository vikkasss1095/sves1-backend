const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');

const generateToken = (id) =>
  jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }  // ✅ FIX
  );
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, companyName, phone, gstNumber } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name,
      email,
      password,
      companyName,
      phone,
      gstNumber,
      role: 'vendor',
    });

    // Notify admins about new vendor registration
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map((admin) => ({
      recipient: admin._id,
      type: 'general',
      title: 'New Vendor Registration',
      message: `${name} (${companyName}) has registered and is awaiting approval.`,
    }));
    if (notifications.length > 0) await Notification.insertMany(notifications);

    res.status(201).json({
      message: 'Registration successful. Awaiting admin approval.',
      token: generateToken(user._id),
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' });

    res.json({
      token: generateToken(user._id),
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// @route PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, changePassword };