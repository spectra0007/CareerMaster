const pool = require('../config/db');
const emailService = require('../services/emailService');

class SubscriptionService {
  async activateSubscription(userId, paymentId) {
    const plan = 'pro';
    const status = 'active';

    // Calculate start and end for 1 month subscription
    const now = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(now.getMonth() + 1);

    const subscriptionId = `sub_${paymentId}`; // Using payment ID as surrogate sub ID

    const insertText = `
      INSERT INTO subscriptions (stripe_subscription_id, stripe_customer_id, user_id, status, plan, current_period_start, current_period_end)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (stripe_subscription_id)
      DO UPDATE SET 
        status = EXCLUDED.status,
        plan = EXCLUDED.plan,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        updated_at = NOW()
      RETURNING *
    `;
    // Reusing the stripe columns for razorpay IDs so we don't need a DB migration immediately
    const insertValues = [subscriptionId, `cus_${userId}`, userId, status, plan, now, oneMonthFromNow];

    const { rows } = await pool.query(insertText, insertValues);

    // Send confirmation email
    const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
    if (userRes.rows[0]?.email) {
      emailService.sendSubscriptionConfirmation(userRes.rows[0].email, plan).catch(console.error);
    }

    return rows[0];
  }
}

module.exports = new SubscriptionService();
