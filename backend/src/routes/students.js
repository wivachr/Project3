const router = require('express').Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

const buildSearch = (key) =>
  key ? `AND (s.id_student LIKE ? OR s.name_student LIKE ? OR s.sname_student LIKE ?)` : '';
const searchParams = (key) => (key ? [`%${key}%`, `%${key}%`, `%${key}%`] : []);

// GET /api/students?page=1&limit=20&key=
router.get('/', auth([1, 2]), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const key = req.query.key || '';
    const offset = (page - 1) * limit;
    const searchSql = buildSearch(key);

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM student s WHERE 1 ${searchSql}`,
      searchParams(key)
    );
    const [rows] = await pool.query(
      `SELECT s.*, t.name_title, f.name_faculty, d.name_department, di.name_division
       FROM student s
       LEFT JOIN title t ON s.id_title=t.id_title
       LEFT JOIN faculty f ON s.id_faculty=f.id_faculty
       LEFT JOIN department d ON s.id_department=d.id_department
       LEFT JOIN division di ON s.id_division=di.id_division
       WHERE 1 ${searchSql}
       ORDER BY s.id_student DESC LIMIT ? OFFSET ?`,
      [...searchParams(key), limit, offset]
    );
    res.json({ data: rows, total, page, limit });
  } catch (err) { next(err); }
});

// GET /api/students/me — student's own profile
router.get('/me', auth([4]), async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, t.name_title, f.name_faculty, d.name_department, di.name_division, c.name_curriculum
       FROM student s
       LEFT JOIN title t ON s.id_title=t.id_title
       LEFT JOIN faculty f ON s.id_faculty=f.id_faculty
       LEFT JOIN department d ON s.id_department=d.id_department
       LEFT JOIN division di ON s.id_division=di.id_division
       LEFT JOIN curriculum c ON s.id_curr=c.id_curr
       WHERE s.id_student=(SELECT username FROM user WHERE id_user=?)`, [req.user.iduser]
    );
    res.json(rows[0] || null);
  } catch (err) { next(err); }
});

// GET /api/students/:id
router.get('/:id', auth([1, 2, 4]), async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, t.name_title, f.name_faculty, d.name_department, di.name_division, c.name_curriculum
       FROM student s
       LEFT JOIN title t ON s.id_title=t.id_title
       LEFT JOIN faculty f ON s.id_faculty=f.id_faculty
       LEFT JOIN department d ON s.id_department=d.id_department
       LEFT JOIN division di ON s.id_division=di.id_division
       LEFT JOIN curriculum c ON s.id_curr=c.id_curr
       WHERE s.id_student=?`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'ไม่พบข้อมูลนักศึกษา' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /api/students
router.post('/', auth([1, 2]), async (req, res, next) => {
  try {
    const { id_student, id_user, id_title, name_student, sname_student, id_faculty, id_department, id_division, id_curr } = req.body;
    await pool.query(
      'INSERT INTO student (id_student,id_user,id_title,name_student,sname_student,id_faculty,id_department,id_division,id_curr) VALUES (?,?,?,?,?,?,?,?,?)',
      [id_student, id_user, id_title, name_student, sname_student, id_faculty, id_department, id_division, id_curr]
    );
    res.status(201).json({ message: 'เพิ่มข้อมูลนักศึกษาสำเร็จ' });
  } catch (err) { next(err); }
});

// PUT /api/students/:id
router.put('/:id', auth([1, 2]), async (req, res, next) => {
  try {
    const { id_title, name_student, sname_student, id_faculty, id_department, id_division, id_curr } = req.body;
    await pool.query(
      'UPDATE student SET id_title=?,name_student=?,sname_student=?,id_faculty=?,id_department=?,id_division=?,id_curr=? WHERE id_student=?',
      [id_title, name_student, sname_student, id_faculty, id_department, id_division, id_curr, req.params.id]
    );
    res.json({ message: 'แก้ไขข้อมูลนักศึกษาสำเร็จ' });
  } catch (err) { next(err); }
});

// DELETE /api/students/:id
router.delete('/:id', auth([1, 2]), async (req, res, next) => {
  try {
    await pool.query('DELETE FROM student WHERE id_student=?', [req.params.id]);
    res.json({ message: 'ลบข้อมูลนักศึกษาสำเร็จ' });
  } catch (err) { next(err); }
});

module.exports = router;
