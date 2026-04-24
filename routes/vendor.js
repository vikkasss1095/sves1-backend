const express = require('express');
const router = express.Router();

// 🔥 IMPORTANT FIX — सही import
const vendorController = require('../controllers/vendorController');

const { protect } = require('../middleware/authMiddleware');
const { isVendor } = require('../middleware/roleMiddleware');
const { upload } = require('../config/cloudinary');

// middleware
router.use(protect, isVendor);

// routes
router.get('/dashboard', vendorController.getDashboardStats);
router.put('/profile', vendorController.updateProfile);
router.delete('/account', vendorController.deleteAccount);

// 🔥 MAIN ROUTE (UPLOAD)
router.post('/documents', upload.single('file'), vendorController.uploadDocument);

router.get('/documents', vendorController.getDocuments);
router.delete('/documents/:id', vendorController.deleteDocument);
router.get('/ratings', vendorController.getRatings);
router.get('/analytics', vendorController.getAnalytics);

module.exports = router;