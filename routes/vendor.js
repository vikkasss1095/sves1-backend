const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');
const { isVendor } = require('../middleware/roleMiddleware');
const { upload } = require('../config/cloudinary');
const User = require('../models/User');

const uploadFields = upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'companyLogo', maxCount: 1 },
  { name: 'businessLicense', maxCount: 1 },
]);

// ✅ PUBLIC REGISTRATION ROUTE
router.post('/profile', uploadFields, async (req, res) => {
  try {
    if (!req.body.data) return res.status(400).json({ message: 'Form data missing' });

    let data = JSON.parse(req.body.data);
    if (!data.email || !data.password) return res.status(400).json({ message: 'Email and Password required' });

    data.name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email;

    // Mapping files
    if (req.files?.profilePhoto?.[0]) data.profilePhotoUrl = req.files.profilePhoto[0].path;
    if (req.files?.resume?.[0]) data.resumeUrl = req.files.resume[0].path;
    if (req.files?.companyLogo?.[0]) data.companyLogoUrl = req.files.companyLogo[0].path;
    if (req.files?.businessLicense?.[0]) data.businessLicenseUrl = req.files.businessLicense[0].path;

    data.status = 'pending';
    data.role = 'vendor';

    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'Email already registered.' });

    const vendor = await User.create(data);
    res.status(201).json({ message: 'Profile created successfully.', vendorId: vendor._id });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ PROTECTED ROUTES
router.use(protect, isVendor);

router.get('/dashboard', vendorController.getDashboardStats);
router.put('/profile', uploadFields, vendorController.updateProfile); // Update profile also supports files
router.delete('/account', vendorController.deleteAccount);
router.post('/documents', upload.single('file'), vendorController.uploadDocument);
router.get('/documents', vendorController.getDocuments);
router.delete('/documents/:id', vendorController.deleteDocument);
router.get('/ratings', vendorController.getRatings);
router.get('/analytics', vendorController.getAnalytics);

module.exports = router;