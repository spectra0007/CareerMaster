// ============================================================
// Stripe Configuration
// ============================================================
const Stripe = require('stripe');

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
    : null;

module.exports = stripe;
