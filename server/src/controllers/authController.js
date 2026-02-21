const { Webhook } = require('svix');
const userService = require('../services/userService');
const emailService = require('../services/emailService');

const handleClerkWebhook = async (req, res) => {
    const payload = req.body;
    const headers = req.headers;

    // 1. Verify webhook signature
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    let msg;

    try {
        msg = wh.verify(payload, {
            'svix-id': headers['svix-id'],
            'svix-timestamp': headers['svix-timestamp'],
            'svix-signature': headers['svix-signature'],
        });
    } catch (err) {
        console.error('❌ Clerk webhook verification failed:', err.message);
        return res.status(400).json({ success: false, error: 'Invalid webhook signature' });
    }

    // 2. Process event
    const { type, data } = msg;

    console.log(`[Clerk Webhook] Received event: ${type}`);

    try {
        switch (type) {
            case 'user.created':
                await userService.syncUser(data);
                await emailService.sendWelcomeEmail(
                    data.email_addresses?.[0]?.email_address,
                    data.first_name
                );
                console.log(`✅ Synced new user from Clerk: ${data.id}`);
                break;

            case 'user.updated':
                await userService.updateUser(data);
                console.log(`✅ Updated user from Clerk: ${data.id}`);
                break;

            case 'user.deleted':
                await userService.deleteUser(data.id);
                console.log(`✅ Deleted user from DB matching Clerk ID: ${data.id}`);
                break;

            default:
                console.log(`ℹ️  Unhandled Clerk event type: ${type}`);
        }

        return res.status(200).json({ success: true, message: 'Webhook processed successfully' });
    } catch (err) {
        console.error(`❌ Error processing Clerk event: ${err.message}`);
        // Return 500 to tell Clerk to retry
        return res.status(500).json({ success: false, error: 'Internal webhook processing error' });
    }
};

module.exports = {
    handleClerkWebhook,
};
