// ============================================================
// Sentry Error Monitoring Configuration
// ============================================================
const Sentry = require('@sentry/node');

function initSentry(app) {
    if (!process.env.SENTRY_DSN) {
        console.warn('⚠️  SENTRY_DSN not set — error monitoring disabled');
        return;
    }

    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    });

    // Sentry error handler (must be after all routes)
    if (app) {
        Sentry.setupExpressErrorHandler(app);
    }

    console.log('✅ Sentry initialized');
}

module.exports = { initSentry, Sentry };
