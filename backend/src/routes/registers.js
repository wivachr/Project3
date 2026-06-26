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

// POST /api/registers/import — import CSV (year,semester,id_student,id_subject,section)
router.post('/import', auth([1, 2]), async (req, res, next) => {
  try {
    const { rows } = req.body; // array of {year_registration,semester_registration,id_student,id_subject,section}
    if (!Array.isArray(rows) || !rows.length) return res.status(400).json({ message: 'ไม่มีข้อมูล' });
    let inserted = 0, skipped = 0;
    for (const r of rows) {
      try {
        await pool.query(
          'INSERT IGNORE INTO registration (year_registration,semester_registration,id_student,id_subject,section) VALUES (?,?,?,?,?)',
          [r[0], r[1], r[2], r[3], r[4]]
        );
        inserted++;
      } catch { skipped++; }
    }
    res.json({ message: `นำเข้าสำเร็จ ${inserted} แถว, ข้าม ${skipped} แถว` });
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
