const pool = require('../config/db');

class LeetcodeService {
    async getAllPlans() {
        const text = `SELECT * FROM leetcode_plans ORDER BY "order" ASC, created_at DESC`;
        const { rows } = await pool.query(text);
        return rows;
    }

    async getUserProgress(userId) {
        const text = `SELECT * FROM progress_tracking WHERE user_id = $1`;
        const { rows } = await pool.query(text, [userId]);
        return rows;
    }

    async updateProgress(userId, planId, status, notes) {
        const completedAt = status === 'completed' ? new Date().toISOString() : null;
        const text = `
      INSERT INTO progress_tracking (user_id, plan_id, status, notes, completed_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, plan_id)
      DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes, completed_at = EXCLUDED.completed_at, updated_at = NOW()
      RETURNING *
    `;
        const { rows } = await pool.query(text, [userId, planId, status, notes, completedAt]);
        return rows[0];
    }

    // Admin methods
    async createPlan(planData) {
        const { title, description, difficulty, category, leetcode_number, leetcode_url, solution_hint, order } = planData;
        const text = `
      INSERT INTO leetcode_plans (title, description, difficulty, category, leetcode_number, leetcode_url, solution_hint, "order")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
        const values = [title, description, difficulty, category, leetcode_number, leetcode_url, solution_hint, order];
        const { rows } = await pool.query(text, values);
        return rows[0];
    }
}

module.exports = new LeetcodeService();
