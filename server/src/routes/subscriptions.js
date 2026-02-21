const express = require('express');
const router = express.Router();
const { createCheckoutSession, createPortalSession, handleWebhook } = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Webhook must come before authentication! And requires raw body.
// index.js mounts this route normally but skips json parsing for `/api/subscriptions/webhook`
router.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(handleWebhook));

// Protected routes
router.use(authenticate);
router.post('/checkout', asyncHandler(createCheckoutSession));
router.post('/portal', asyncHandler(createPortalSession));

module.exports = router;
