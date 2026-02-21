// ============================================================
// Error Handling Middleware
// ============================================================

/**
 * Async route wrapper — catches errors and passes them to Express error handler.
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global error handler — returns consistent JSON error responses.
 */
const errorHandler = (err, req, res, _next) => {
    console.error('❌ Error:', err.message);

    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'Internal server error'
        : err.message;

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};

module.exports = { asyncHandler, errorHandler };
