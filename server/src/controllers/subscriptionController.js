const stripe = require('../config/stripe');
const userService = require('../services/userService');
const subscriptionService = require('../services/subscriptionService');

const createCheckoutSession = async (req, res) => {
    const clerkId = req.auth.userId;
    const user = await userService.getUserProfile(clerkId);

    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }

    let customerId = undefined;
    // If user already has a subscription record (maybe canceled), use that customer ID
    if (user.stripe_customer_id) {
        customerId = user.stripe_customer_id;
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [
            {
                price: process.env.STRIPE_PRICE_ID,
                quantity: 1,
            },
        ],
        subscription_data: {
            metadata: {
                user_id: user.id, // Critical for webhook mapper
            },
        },
        success_url: `${process.env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/pricing`,
    });

    res.json({ success: true, url: session.url });
};

const createPortalSession = async (req, res) => {
    const clerkId = req.auth.userId;
    const user = await userService.getUserProfile(clerkId);

    // We need to fetch their customer ID from the DB.
    // We need to add stripe_customer_id to getUserProfile query. I will update userService later if needed.
    // Actually, let's just query it here for simplicity.
    const pool = require('../config/db');
    const { rows } = await pool.query('SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1 LIMIT 1', [user.id]);
    const customerId = rows[0]?.stripe_customer_id;

    if (!customerId) {
        return res.status(400).json({ success: false, error: 'No active subscription found' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.CLIENT_URL}/dashboard`,
    });

    res.json({ success: true, url: portalSession.url });
};

const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`❌ Stripe Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await subscriptionService.handleSubscriptionChange(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await subscriptionService.handleSubscriptionDeleted(event.data.object);
                break;
            default:
                console.log(`Unhandled Stripe event type ${event.type}`);
        }

        res.json({ received: true });
    } catch (err) {
        console.error(`❌ Webhook processing failed:`, err.message);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

module.exports = {
    createCheckoutSession,
    createPortalSession,
    handleWebhook,
};
