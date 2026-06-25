const router = require('express').Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/registers?page=1&year=&semester=&key=
router.get('/', auth([1, 2]), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { year, semester, key } = req.query;

    const conditions = [];
    const params = [];
    if (year) { conditions.push('r.year_registration=?'); params.push(year); }
    if (semester) { conditions.push('r.semester_registration=?'); params.push(semester); }
    if (key) {
      conditions.push('(r.id_student LIKE ? OR s.name_student LIKE ? OR s.sname_student LIKE ? OR sub.name_subject LIKE ?)');
      params.push(`%${key}%`, `%${key}%`, `%${key}%`, `%${key}%`);
    }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM registration r
       LEFT JOIN student s ON r.id_student=s.id_student
       LEFT JOIN subject sub ON r.id_subject=sub.id_subject
       ${where}`, params
    );
    const [rows] = await pool.query(
      `SELECT r.*, s.name_student, s.sname_student, t.name_title, sub.name_subject
       FROM registration r
       LEFT JOIN student s ON r.id_student=s.id_student
       LEFT JOIN title t ON s.id_title=t.id_title
       LEFT JOIN subject sub ON r.id_subject=sub.id_subject
       ${where}
       ORDER BY r.year_registration DESC, r.semester_registration DESC, r.id_student
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    res.json({ data: rows, total, page, limit });
  } catch (err) { next(err); }
});

// DELETE /api/registers
router.delete('/', auth([1, 2]), async (req, res, next) => {
  try {
    const { year_registration, semester_registration, id_student, id_subject, section } = req.body;
    await pool.query(
      'DELETE FROM registration WHERE year_registration=? AND semester_registration=? AND id_student=? AND id_subject=? AND section=?',
      [year_registration, semester_registration, id_student, id_subject, section]
    );
    res.json({ message: 'ลบข้อมูลการลงทะเบียนสำเร็จ' });
  } catch (err) { next(err); }
});

module.exports = router;
