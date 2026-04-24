const express = require('express');
const router = express.Router();
const { createPayment, getMyPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin, isVendor } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', isAdmin, createPayment);
router.get('/my', isVendor, getMyPayments);

module.exports = router;