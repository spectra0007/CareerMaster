const pool = require('../config/db');

class VideoService {
    async getAllVideos() {
        const text = `SELECT id, title, description, thumbnail_url, duration, category, is_premium, created_at FROM videos ORDER BY created_at DESC`;
        const { rows } = await pool.query(text);
        return rows;
    }

    async getVideoById(id) {
        const text = `SELECT * FROM videos WHERE id = $1`;
        const { rows } = await pool.query(text, [id]);
        return rows[0];
    }

    // Admin methods
    async createVideo(videoData) {
        const { title, description, cloudinary_id, cloudinary_url, thumbnail_url, duration, category, is_premium, upload_by } = videoData;
        const text = `
      INSERT INTO videos (title, description, cloudinary_id, cloudinary_url, thumbnail_url, duration, category, is_premium, upload_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
        const values = [title, description, cloudinary_id, cloudinary_url, thumbnail_url, duration, category, is_premium, upload_by];
        const { rows } = await pool.query(text, values);
        return rows[0];
    }

    async deleteVideo(id) {
        const { rows } = await pool.query(`DELETE FROM videos WHERE id = $1 RETURNING *`, [id]);
        return rows[0];
    }
}

module.exports = new VideoService();
