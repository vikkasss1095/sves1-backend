const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');
const { isVendor } = require('../middleware/roleMiddleware');
const { upload } = require('../config/cloudinary');

// Fields mapping
const vendorUploadFields = upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'companyLogo', maxCount: 1 },
  { name: 'businessLicense', maxCount: 1 },
]);

// ✅ Ye route registration ke liye hai (Public)
router.post('/register-profile', vendorUploadFields, vendorController.registerVendor);

// ✅ Protected Routes
router.use(protect, isVendor);

router.get('/dashboard', vendorController.getDashboardStats);
router.put('/profile', vendorUploadFields, vendorController.updateProfile);
router.delete('/account', vendorController.deleteAccount);
router.post('/documents', upload.single('file'), vendorController.uploadDocument);
router.get('/documents', vendorController.getDocuments);
router.delete('/documents/:id', vendorController.deleteDocument);
router.get('/ratings', vendorController.getRatings);

module.exports = router;