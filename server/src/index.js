// ============================================================
// Express Server — Entry Point
// ============================================================
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initSentry } = require('./config/sentry');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5001;

// ----- Security & Middleware -----
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));

// Rate limiting — 100 requests per 15 min per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// ----- Routes (Pre-JSON Parsing) -----
// Clerk webhooks require the raw body for Svix signature verification
app.use('/api/auth', require('./routes/auth'));

// ----- Body Parsing -----
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ----- Routes -----
// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'CareerMaster API is running 🚀', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/users', require('./routes/users'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/leetcode', require('./routes/leetcode'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/admin', require('./routes/admin'));

// ----- Error Handling -----
initSentry(app);
app.use(errorHandler);

// ----- Start Server -----
app.listen(PORT, () => {
    console.log(`\n🚀 CareerMaster API running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
