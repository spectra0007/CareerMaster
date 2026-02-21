// ============================================================
// Clerk Authentication Middleware
// ============================================================
const { requireAuth } = require('@clerk/express');
const pool = require('../config/db');

/**
 * Middleware: Verify Clerk JWT token
 * Injects req.auth with userId (Clerk ID)
 */
const authenticate = requireAuth({
    signInUrl: process.env.CLIENT_URL + '/sign-in',
});

/**
 * Middleware: Admin Role Check
 * First ensures user is authenticated, then checks if role is 'admin' in our DB.
 */
const requireAdmin = [
    authenticate,
    async (req, res, next) => {
        try {
            const clerkId = req.auth.userId;

            // Make sure we have a user
            if (!clerkId) {
                return res.status(401).json({ success: false, error: 'Unauthorized' });
            }

            // Query database to check role
            const { rows } = await pool.query(
                'SELECT role FROM users WHERE clerk_id = $1 LIMIT 1',
                [clerkId]
            );

            const user = rows[0];

            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found in database' });
            }

            if (user.role !== 'admin') {
                return res.status(403).json({ success: false, error: 'Access denied: Admin only' });
            }

            // Attach internal user details to req for downstream usage
            req.userRole = user.role;
            next();
        } catch (err) {
            next(err);
        }
    }
];

module.exports = {
    authenticate,
    requireAdmin,
};
