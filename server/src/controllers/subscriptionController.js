const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const userService = require('../services/userService');
const subscriptionService = require('../services/subscriptionService');

const createOrder = async (req, res) => {
    const clerkId = req.auth.userId;
    const user = await userService.getUserProfile(clerkId);

    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!razorpay) {
        return res.status(500).json({ success: false, error: 'Razorpay keys not configured on server' });
    }

    try {
        const options = {
            amount: 249900, // ₹2499.00 in paise
            currency: 'INR',
            receipt: `rcpt_${user.id}_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json({ success: true, order });
    } catch (err) {
        console.error('Error creating Razorpay order:', err);
        res.status(500).json({ error: 'Failed to create order' });
    }
};

const verifyPayment = async (req, res) => {
    const clerkId = req.auth.userId;
    const user = await userService.getUserProfile(clerkId);

    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        // Payment is legit. Save to DB.
        try {
            await subscriptionService.activateSubscription(user.id, razorpay_payment_id);
            res.json({ success: true });
        } catch (err) {
            console.error('Error activating subscription:', err);
            res.status(500).json({ success: false, error: 'Failed to update database' });
        }
    } else {
        res.status(400).json({ success: false, error: 'Invalid signature. Payment verification failed.' });
    }
};

module.exports = {
    createOrder,
    verifyPayment,
};
