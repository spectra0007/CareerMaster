// ============================================================
// Database Configuration — Supabase PostgreSQL
// ============================================================
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test connection on startup
pool.query('SELECT NOW()')
    .then(() => console.log('✅ Database connected'))
    .catch((err) => console.error('❌ Database connection error:', err.message));

module.exports = pool;
