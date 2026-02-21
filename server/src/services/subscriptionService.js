const pool = require('../config/db');
const emailService = require('../services/emailService');

class SubscriptionService {
  async handleSubscriptionChange(subscription) {
    const { id, customer, status, items, current_period_start, current_period_end } = subscription;
    const planId = items.data[0].price.id;
    // Map Stripe price IDs to your plan names if needed, for now we will just use 'pro' for our single tier.
    const plan = 'pro';

    const text = `
      INSERT INTO subscriptions (stripe_subscription_id, stripe_customer_id, status, plan, current_period_start, current_period_end)
      VALUES ($1, $2, $3, $4, to_timestamp($5), to_timestamp($6))
      ON CONFLICT (stripe_subscription_id)
      DO UPDATE SET 
        status = EXCLUDED.status,
        plan = EXCLUDED.plan,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        updated_at = NOW()
      RETURNING *
    `;
    const values = [id, customer, status, plan, current_period_start, current_period_end];

    // We also need to map the customer to the user_id.
    // If it's a new subscription, we might not have user_id here directly unless we passed it in metadata.
    // Let's assume user_id was set in customer metadata when creating checkout session or we query the customer.
    // But since `user_id` is NOT NULL in `subscriptions` table and we didn't include it in INSERT,
    // we must fix the insert to include user_id.

    // To fix this, when creating the checkout session we will pass user_id in subscription_data.metadata.
    // Therefore, subscription.metadata.user_id should exist.
    const userId = subscription.metadata.user_id;

    if (userId) {
      const insertText = `
        INSERT INTO subscriptions (stripe_subscription_id, stripe_customer_id, user_id, status, plan, current_period_start, current_period_end)
        VALUES ($1, $2, $3, $4, $5, to_timestamp($6), to_timestamp($7))
        ON CONFLICT (stripe_subscription_id)
        DO UPDATE SET 
          status = EXCLUDED.status,
          plan = EXCLUDED.plan,
          current_period_start = EXCLUDED.current_period_start,
          current_period_end = EXCLUDED.current_period_end,
          updated_at = NOW()
        RETURNING *
      `;
      const insertValues = [id, customer, userId, status, plan, current_period_start, current_period_end];
      const { rows } = await pool.query(insertText, insertValues);

      // If it's a new subscription and they just paid, send email
      if (status === 'active') {
        const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
        if (userRes.rows[0]?.email) {
          // Fire and forget email
          emailService.sendSubscriptionConfirmation(userRes.rows[0].email, plan).catch(console.error);
        }
      }

      return rows[0];
    } else {
      // If meta user_id is missing, we try to update based on stripe_customer_id
      const updateText = `
          UPDATE subscriptions
          SET status = $2, plan = $3, current_period_start = to_timestamp($4), current_period_end = to_timestamp($5), updated_at = NOW()
          WHERE stripe_subscription_id = $1 OR stripe_customer_id = $6
          RETURNING *
        `;
      const { rows } = await pool.query(updateText, [id, status, plan, current_period_start, current_period_end, customer]);
      return rows[0];
    }
  }

  async handleSubscriptionDeleted(subscription) {
    const { id } = subscription;
    const text = `
      UPDATE subscriptions
      SET status = 'canceled', updated_at = NOW()
      WHERE stripe_subscription_id = $1
      RETURNING *
    `;
    const { rows } = await pool.query(text, [id]);
    return rows[0];
  }
}

module.exports = new SubscriptionService();
