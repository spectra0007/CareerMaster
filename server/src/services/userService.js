// ============================================================
// User Service — Database Operations
// ============================================================
const pool = require('../config/db');

class UserService {
  /**
   * Sync user from Clerk to our PostgreSQL database
   */
  async syncUser(clerkPayload) {
    const { id, email_addresses, first_name, last_name, image_url } = clerkPayload;

    const email = email_addresses && email_addresses.length > 0
      ? email_addresses[0].email_address
      : null;

    if (!id || !email) {
      throw new Error('Missing required fields for user sync: clerk_id or email');
    }

    const text = `
      INSERT INTO users (clerk_id, email, first_name, last_name, avatar_url)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) 
      DO UPDATE SET
        clerk_id = EXCLUDED.clerk_id,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW()
      RETURNING *;
    `;

    const values = [id, email, first_name || '', last_name || '', image_url || ''];

    const { rows } = await pool.query(text, values);
    return rows[0];
  }

  /**
   * Update existing user details from Clerk webhook
   */
  async updateUser(clerkPayload) {
    const { id, first_name, last_name, image_url } = clerkPayload;

    const text = `
      UPDATE users
      SET 
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        avatar_url = COALESCE($4, avatar_url),
        updated_at = NOW()
      WHERE clerk_id = $1
      RETURNING *;
    `;

    const values = [id, first_name, last_name, image_url];
    const { rows } = await pool.query(text, values);
    return rows[0];
  }

  /**
   * Delete user from local database when deleted in Clerk
   */
  async deleteUser(clerkId) {
    const text = `DELETE FROM users WHERE clerk_id = $1 RETURNING id;`;
    const { rows } = await pool.query(text, [clerkId]);
    return rows[0];
  }

  /**
   * Get user profile with active subscription status
   */
  async getUserProfile(clerkId) {
    const text = `
      SELECT u.id, u.clerk_id, u.email, u.first_name, u.last_name, u.avatar_url, u.role,
             s.plan, s.status as subscription_status
      FROM users u
      LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
      WHERE u.clerk_id = $1
    `;
    const { rows } = await pool.query(text, [clerkId]);
    return rows[0];
  }
}

module.exports = new UserService();
