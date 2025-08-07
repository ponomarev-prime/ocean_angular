require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Получить общие данные организаций
app.get('/api/general', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, sort = 'id', order = 'asc', search = '' } = req.query;
    const offset = (page - 1) * pageSize;
    const [rows] = await db.query(
      `SELECT * FROM organizations_general WHERE name LIKE ? ORDER BY ${sort} ${order === 'desc' ? 'DESC' : 'ASC'} LIMIT ? OFFSET ?`,
      [`%${search}%`, Number(pageSize), Number(offset)]
    );
    const [countRows] = await db.query(
      'SELECT COUNT(*) as count FROM organizations_general WHERE name LIKE ?',
      [`%${search}%`]
    );
    res.json({ data: rows, total: countRows[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить детальные данные организаций
app.get('/api/details', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, sort = 'id', order = 'asc', search = '' } = req.query;
    const offset = (page - 1) * pageSize;
    const [rows] = await db.query(
      `SELECT * FROM organizations_details WHERE department LIKE ? ORDER BY ${sort} ${order === 'desc' ? 'DESC' : 'ASC'} LIMIT ? OFFSET ?`,
      [`%${search}%`, Number(pageSize), Number(offset)]
    );
    const [countRows] = await db.query(
      'SELECT COUNT(*) as count FROM organizations_details WHERE department LIKE ?',
      [`%${search}%`]
    );
    res.json({ data: rows, total: countRows[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
