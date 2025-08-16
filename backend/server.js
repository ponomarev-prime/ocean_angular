require('dotenv').config({ path: '../deploy/backend.env' });
const express = require('express');
const cors = require('cors');
const db = require('./db');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();

const rateLimit = require('express-rate-limit');

// лимит: максимум 100 запросов за 15 минут с одного IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100,                 // максимум 100 запросов
  standardHeaders: true,    // возвращает info в заголовках RateLimit-*
  legacyHeaders: false,     // отключить X-RateLimit-*
  message: { error: 'Too many requests, please try again later.' }
});

/* ===== Middlewares (before routes) ===== */
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// применяем только к /api/*
app.use('/api', apiLimiter);

/* ===== Helpers ===== */
function parsePagination(query) {
  const page = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(query.pageSize ?? '10', 10) || 10));
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

function resolveSorting(query, allowedColumns, defaultSort = 'id') {
  const sortRaw = String(query.sort ?? defaultSort).toLowerCase();
  const orderRaw = String(query.order ?? 'asc').toLowerCase();
  const sort = allowedColumns.has(sortRaw) ? sortRaw : defaultSort;
  const order = orderRaw === 'desc' ? 'DESC' : 'ASC';
  return { sort, order };
}

function resolveSearch(query, def = '') {
  return String(query.search ?? def);
}

/* ===== Routes ===== */
app.get('/api/general', async (req, res) => {
  try {
    const { page, pageSize, offset } = parsePagination(req.query);
    const { sort, order } = resolveSorting(req.query, new Set(['id', 'name']), 'id');
    const search = resolveSearch(req.query);

    const sql = `
      SELECT *
      FROM organizations_general
      WHERE name LIKE ?
      ORDER BY ${sort} ${order}
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(sql, [`%${search}%`, pageSize, offset]);

    const [countRows] = await db.query(
      'SELECT COUNT(*) AS count FROM organizations_general WHERE name LIKE ?',
      [`%${search}%`]
    );

    res.json({ data: rows, total: countRows[0]?.count ?? 0, page, pageSize });
  } catch (err) {
    console.error('GET /api/general failed:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/details', async (req, res) => {
  try {
    const { page, pageSize, offset } = parsePagination(req.query);
    const { sort, order } = resolveSorting(req.query, new Set(['id', 'department']), 'id');
    const search = resolveSearch(req.query);

    const sql = `
      SELECT *
      FROM organizations_details
      WHERE department LIKE ?
      ORDER BY ${sort} ${order}
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(sql, [`%${search}%`, pageSize, offset]);

    const [countRows] = await db.query(
      'SELECT COUNT(*) AS count FROM organizations_details WHERE department LIKE ?',
      [`%${search}%`]
    );

    res.json({ data: rows, total: countRows[0]?.count ?? 0, page, pageSize });
  } catch (err) {
    console.error('GET /api/details failed:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/* ===== Healthcheck ===== */
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

/* ===== Listen ===== */
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
