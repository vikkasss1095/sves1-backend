const express = require('express');

const router = express.Router();

const vendorController = require('../controllers/vendorController');

const { protect } = require('../middleware/authMiddleware');

const { isVendor } = require('../middleware/roleMiddleware');

const { upload } = require('../config/cloudinary');

// ================= MIDDLEWARE =================
router.use(protect, isVendor);

// ================= DASHBOARD =================
router.get(
  '/dashboard',
  vendorController.getDashboardStats
);

// ================= CREATE PROFILE =================
router.post(
  '/profile',

  upload.fields([
    {
      name: 'profilePhoto',
      maxCount: 1,
    },
    {
      name: 'resume',
      maxCount: 1,
    },
    {
      name: 'companyLogo',
      maxCount: 1,
    },
    {
      name: 'businessLicense',
      maxCount: 1,
    },
  ]),

  vendorController.createVendorProfile
);

// ================= UPDATE PROFILE =================
router.put(
  '/profile',
  vendorController.updateProfile
);

// ================= DELETE ACCOUNT =================
router.delete(
  '/account',
  vendorController.deleteAccount
);

// ================= DOCUMENT UPLOAD =================
router.post(
  '/documents',
  upload.single('file'),
  vendorController.uploadDocument
);

// ================= DOCUMENTS =================
router.get(
  '/documents',
  vendorController.getDocuments
);

router.delete(
  '/documents/:id',
  vendorController.deleteDocument
);

// ================= RATINGS =================
router.get(
  '/ratings',
  vendorController.getRatings
);

// ================= ANALYTICS =================
router.get(
  '/analytics',
  vendorController.getAnalytics
);

module.exports = router;