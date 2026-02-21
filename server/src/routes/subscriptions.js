const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Protected routes
router.use(authenticate);
router.post('/order', asyncHandler(createOrder));
router.post('/verify', asyncHandler(verifyPayment));

module.exports = router;
