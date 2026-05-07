const express = require('express');
const router = express.Router();

const vendorController = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');
const { isVendor } = require('../middleware/roleMiddleware');
const { upload } = require('../config/cloudinary');

// ✅ NEW — Profile submit (NO auth required — vendor abhi register kar raha hai)
router.post(
  '/profile',
  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
    { name: 'companyLogo', maxCount: 1 },
    { name: 'businessLicense', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const User = require('../models/User');

      // Frontend ne JSON.stringify karke bheja tha
      const data = JSON.parse(req.body.data);

      // File URLs attach karo agar upload hui hain
      if (req.files?.profilePhoto)
        data.profilePhotoUrl = req.files.profilePhoto[0].path; // cloudinary URL
      if (req.files?.resume)
        data.resumeUrl = req.files.resume[0].path;
      if (req.files?.companyLogo)
        data.companyLogoUrl = req.files.companyLogo[0].path;
      if (req.files?.businessLicense)
        data.businessLicenseUrl = req.files.businessLicense[0].path;

      // name field set karo (User schema me required hai)
      data.name = `${data.firstName || ''} ${data.lastName || ''}`.trim();

      // Status pending set karo
      data.status = 'pending';
      data.isApproved = false;
      data.role = 'vendor';

      // Email already exist toh error
      const existing = await User.findOne({ email: data.email });
      if (existing) {
        return res.status(400).json({ message: 'Email already registered. Please login.' });
      }

      const vendor = await User.create(data);

      res.status(201).json({
        message: 'Profile created successfully. Admin will review and approve.',
        vendorId: vendor._id,
      });
    } catch (err) {
      console.error('Profile submit error:', err);
      res.status(500).json({ message: err.message || 'Server error' });
    }
  }
);

// ── Existing routes (kuch mat badlo) ─────────────────────────────────────────
router.use(protect, isVendor);

router.get('/dashboard', vendorController.getDashboardStats);
router.put('/profile', vendorController.updateProfile);
router.delete('/account', vendorController.deleteAccount);
router.post('/documents', upload.single('file'), vendorController.uploadDocument);
router.get('/documents', vendorController.getDocuments);
router.delete('/documents/:id', vendorController.deleteDocument);
router.get('/ratings', vendorController.getRatings);
router.get('/analytics', vendorController.getAnalytics);

module.exports = router;