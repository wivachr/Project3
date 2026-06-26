const router = require('express').Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/headofdepartment
router.get('/', auth([1, 2, 3]), async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT h.id_teacher, t.name_teacher, t.sname_teacher, at2.name_academictitle
       FROM headofdepartment h
       JOIN teacher t ON h.id_teacher=t.id_teacher
       LEFT JOIN academictitle at2 ON t.id_academictitle=at2.id_academictitle`
    );
    res.json(rows[0] || null);
  } catch (err) { next(err); }
});

// PUT /api/headofdepartment — set head of department
router.put('/', auth([1]), async (req, res, next) => {
  try {
    const { id_teacher } = req.body;
    if (!id_teacher) return res.status(400).json({ message: 'กรุณาเลือกอาจารย์' });
    const [[existing]] = await pool.query('SELECT COUNT(*) AS c FROM headofdepartment');
    if (existing.c > 0) {
      await pool.query('UPDATE headofdepartment SET id_teacher=?', [id_teacher]);
    } else {
      await pool.query('INSERT INTO headofdepartment (id_teacher) VALUES (?)', [id_teacher]);
    }
    res.json({ message: 'เปลี่ยนหัวหน้าภาคสำเร็จ' });
  } catch (err) { next(err); }
});

module.exports = router;
