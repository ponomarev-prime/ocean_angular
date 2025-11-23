const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_PORT = 3306, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// Подсветим недостающие переменные .env
for (const [k, v] of Object.entries({ DB_HOST, DB_USER, DB_PASSWORD, DB_NAME })) {
  if (!v) console.error(`[DB CONFIG] Missing ${k}. Check your .env`);
}

// 1) СНАЧАЛА создаём пул
const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 2) ПОТОМ — проверка соединения (опционально)
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('[DB] Connection OK');
  } catch (e) {
    console.error('[DB] Connection FAILED:', e.message);
  }
})();

module.exports = pool;
