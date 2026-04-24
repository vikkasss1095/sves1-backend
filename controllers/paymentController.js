const Payment = require('../models/Payment');

// @route POST /api/payments (admin creates payment for vendor)
const createPayment = async (req, res) => {
  try {
    const { vendor, task, amount, description } = req.body;
    const payment = await Payment.create({ vendor, task, amount, description });
    res.status(201).json({ message: 'Payment record created', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/payments/my (vendor sees own payments)
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ vendor: req.user._id })
      .populate('task', 'title')
      .sort({ createdAt: -1 });

    const totalEarnings = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    const pendingAmount = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

    res.json({ payments, totalEarnings, pendingAmount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPayment, getMyPayments };