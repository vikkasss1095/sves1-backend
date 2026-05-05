const User = require('../models/User');
const Task = require('../models/Task');
const Rating = require('../models/Rating');
const Document = require('../models/Document');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

// @route GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const [totalVendors, activeVendors, pendingApprovals, totalTasks, completedTasks] =
      await Promise.all([
        User.countDocuments({ role: 'vendor' }),
        User.countDocuments({ role: 'vendor', isApproved: true, isActive: true }),
        User.countDocuments({ role: 'vendor', isApproved: false, isActive: true }),
        Task.countDocuments(),
        Task.countDocuments({ status: 'completed' }),
      ]);

    // Monthly vendor growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyGrowth = await User.aggregate([
      { $match: { role: 'vendor', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      totalVendors,
      activeVendors,
      pendingApprovals,
      totalTasks,
      completedTasks,
      monthlyGrowth,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/admin/vendors
const getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;
    const query = { role: 'vendor' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
      ];
    }

    if (status === 'approved') query.isApproved = true;
    if (status === 'pending') query.isApproved = false;

    const total = await User.countDocuments(query);
    const vendors = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ vendors, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/admin/vendors/:id/approve
const approveVendor = async (req, res) => {
  try {
    const vendor = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    await Notification.create({
      recipient: vendor._id,
      sender: req.user._id,
      type: 'profile_approved',
      title: 'Account Approved!',
      message: 'Your vendor account has been approved. You can now receive tasks.',
    });

    res.json({ message: 'Vendor approved', vendor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/admin/vendors/:id/reject
const rejectVendor = async (req, res) => {
  try {
    const vendor = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: false, isActive: false },
      { new: true }
    );

    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    await Notification.create({
      recipient: vendor._id,
      sender: req.user._id,
      type: 'profile_rejected',
      title: 'Account Rejected',
      message: req.body.reason || 'Your vendor account has been rejected by the admin.',
    });

    res.json({ message: 'Vendor rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/admin/vendors/:id
const deleteVendor = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vendor deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔥 ✅ ADD KIYA GAYA FUNCTION (ONLY NEW ADDITION)
const getSingleVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id).select('-password');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/admin/evaluation
const getVendorRankings = async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor', isApproved: true }).select('-password');

    const rankings = await Promise.all(
      vendors.map(async (v) => {
        const ratings = await Rating.find({ vendor: v._id });
        const avgScore =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.overallScore, 0) / ratings.length
            : 0;

        const completedTasks = await Task.countDocuments({
          assignedTo: v._id,
          status: 'completed',
        });
        const totalTasks = await Task.countDocuments({ assignedTo: v._id });

        return {
          vendor: v,
          avgScore: parseFloat(avgScore.toFixed(2)),
          ratingsCount: ratings.length,
          completedTasks,
          totalTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        };
      })
    );

    rankings.sort((a, b) => b.avgScore - a.avgScore);
    res.json({ rankings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/admin/ratings
const rateVendor = async (req, res) => {
  try {
    const { vendor, qualityScore, deliveryScore, costEfficiencyScore, complianceScore, feedback, period } = req.body;

    const rating = await Rating.create({
      vendor,
      ratedBy: req.user._id,
      qualityScore,
      deliveryScore,
      costEfficiencyScore,
      complianceScore,
      feedback,
      period,
    });

    await Notification.create({
      recipient: vendor,
      sender: req.user._id,
      type: 'general',
      title: 'New Performance Rating',
      message: `You received a new performance rating. Overall score: ${rating.overallScore}/10`,
    });

    res.status(201).json({ message: 'Rating submitted', rating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/admin/documents
const getAllDocuments = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const docs = await Document.find(query)
      .populate('vendor', 'name companyName email')
      .sort({ createdAt: -1 });

    res.json({ documents: docs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/admin/documents/:id
const reviewDocument = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;

    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { status, adminRemarks },
      { new: true }
    ).populate('vendor', 'name');

    await Notification.create({
      recipient: doc.vendor._id,
      sender: req.user._id,
      type: 'document',
      title: `Document ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your document "${doc.name}" has been ${status}. ${adminRemarks || ''}`,
    });

    res.json({ message: 'Document reviewed', document: doc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/admin/payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('vendor', 'name companyName')
      .populate('task', 'title')
      .sort({ createdAt: -1 });

    res.json({ payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/admin/payments/:id/approve
const approvePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'paid', approvedBy: req.user._id, paidAt: new Date() },
      { new: true }
    ).populate('vendor', 'name');

    await Notification.create({
      recipient: payment.vendor._id,
      sender: req.user._id,
      type: 'payment',
      title: 'Payment Approved',
      message: `Payment of ₹${payment.amount} has been approved and processed.`,
    });

    res.json({ message: 'Payment approved', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ FINAL EXPORT (ADD KIYA GAYA)
module.exports = {
  getDashboardStats,
  getAllVendors,
  approveVendor,
  rejectVendor,
  deleteVendor,
  getSingleVendor, // 🔥 ADD
  getVendorRankings,
  rateVendor,
  getAllDocuments,
  reviewDocument,
  getAllPayments,
  approvePayment,
};