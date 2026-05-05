const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllVendors,
  approveVendor,
  rejectVendor,
  deleteVendor,
  getVendorRankings,
  rateVendor,
  getAllDocuments,
  reviewDocument,
  getAllPayments,
  approvePayment,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

router.use(protect, isAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/vendors', getAllVendors);
router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/reject', rejectVendor);
router.delete('/vendors/:id', deleteVendor);
router.get('/evaluation', getVendorRankings);
router.post('/ratings', rateVendor);
router.get('/documents', getAllDocuments);
router.put('/documents/:id', reviewDocument);
router.get('/payments', getAllPayments);
router.put('/payments/:id/approve', approvePayment);
router.get('/vendors/:id', getSingleVendor); 
module.exports = router;