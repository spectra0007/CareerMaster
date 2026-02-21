// ============================================================
// Auth Routes (`/api/auth`)
// ============================================================
const express = require('express');
const router = express.Router();
const { handleClerkWebhook } = require('../controllers/authController');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Clerk Webhook Handler
 * Endpoint: POST /api/auth/webhook
 * Description: Syncs Clerk users to our local database.
 * Note: Uses express.raw() internally before coming here if configured globally,
 * but since we use express.json() generally, we will ensure it takes stringified JSON or buffer.
 * Actually, Svix requires the raw body or stringified body. 
 * If using express.json() globally, `req.body` is an object, but `svix.verify` requires string/buffer.
 * It's easier to use a raw body parser router specifically.
 */

// Route to handle Clerk webhooks. We must parse body as a string for Svix verification.
router.post(
    '/webhook',
    express.raw({ type: 'application/json' }), // Override global json parser to keep raw string
    asyncHandler(async (req, res, next) => {
        // Because we use express.raw, req.body is a Buffer here
        req.body = req.body && req.body.length ? req.body.toString('utf8') : '';
        await handleClerkWebhook(req, res, next);
    })
);

module.exports = router;
