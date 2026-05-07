const express = require('express');
const router = express.Router();

const vendorController = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');
const { isVendor } = require('../middleware/roleMiddleware');
const { upload, vendorUpload } = require('../config/cloudinary');

// ✅ PUBLIC ROUTE — auth middleware se UPAR hona chahiye
router.post(
  '/profile',
  vendorUpload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
    { name: 'companyLogo', maxCount: 1 },
    { name: 'businessLicense', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const User = require('../models/User');

      console.log('req.body:', req.body);       // debug
      console.log('req.files:', req.files);     // debug

      if (!req.body.data) {
        return res.status(400).json({ message: 'Form data missing — req.body.data is undefined' });
      }

      let data;
      try {
        data = JSON.parse(req.body.data);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid JSON in form data' });
      }

      if (!data.email)    return res.status(400).json({ message: 'Email is required' });
      if (!data.password) return res.status(400).json({ message: 'Password is required' });

      data.name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email;

      if (req.files?.profilePhoto?.[0])     data.profilePhotoUrl    = req.files.profilePhoto[0].path;
      if (req.files?.resume?.[0])           data.resumeUrl          = req.files.resume[0].path;
      if (req.files?.companyLogo?.[0])      data.companyLogoUrl     = req.files.companyLogo[0].path;
      if (req.files?.businessLicense?.[0])  data.businessLicenseUrl = req.files.businessLicense[0].path;

      data.status     = 'pending';
      data.isApproved = false;
      data.role       = 'vendor';

      const existing = await User.findOne({ email: data.email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ message: 'Email already registered. Please login.' });
      }

      const vendor = await User.create(data);

      res.status(201).json({
        message: 'Profile created successfully. Admin will review and approve.',
        vendorId: vendor._id,
      });

    } catch (err) {
      if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ message: messages.join(', ') });
      }
      console.error('Profile submit error:', err);
      res.status(500).json({ message: err.message || 'Server error' });
    }
  }
);

// ✅ PROTECTED ROUTES — auth middleware NEECHE hai
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