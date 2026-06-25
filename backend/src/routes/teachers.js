const router = require('express').Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/teachers?page=1&limit=20&key=
router.get('/', auth([1, 2, 3]), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const key = req.query.key || '';
    const offset = (page - 1) * limit;
    const where = key ? 'AND (t.id_teacher LIKE ? OR t.name_teacher LIKE ? OR t.sname_teacher LIKE ?)' : '';
    const params = key ? [`%${key}%`, `%${key}%`, `%${key}%`] : [];

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM teacher t WHERE 1 ${where}`, params);
    const [rows] = await pool.query(
      `SELECT t.*, ti.name_title, at2.name_academictitle, f.name_faculty, d.name_department
       FROM teacher t
       LEFT JOIN title ti ON t.id_title=ti.id_title
       LEFT JOIN academictitle at2 ON t.id_academictitle=at2.id_academictitle
       LEFT JOIN faculty f ON t.id_faculty=f.id_faculty
       LEFT JOIN department d ON t.id_department=d.id_department
       WHERE 1 ${where} ORDER BY t.id_teacher LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    res.json({ data: rows, total, page, limit });
  } catch (err) { next(err); }
});

// GET /api/teachers/me — teacher's own profile
router.get('/me', auth([3]), async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, ti.name_title, at2.name_academictitle, f.name_faculty, d.name_department
       FROM teacher t
       LEFT JOIN title ti ON t.id_title=ti.id_title
       LEFT JOIN academictitle at2 ON t.id_academictitle=at2.id_academictitle
       LEFT JOIN faculty f ON t.id_faculty=f.id_faculty
       LEFT JOIN department d ON t.id_department=d.id_department
       WHERE t.id_user=?`, [req.user.iduser]
    );
    res.json(rows[0] || null);
  } catch (err) { next(err); }
});

// GET /api/teachers/:id
router.get('/:id', auth([1, 2, 3]), async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, ti.name_title, at2.name_academictitle, f.name_faculty, d.name_department
       FROM teacher t
       LEFT JOIN title ti ON t.id_title=ti.id_title
       LEFT JOIN academictitle at2 ON t.id_academictitle=at2.id_academictitle
       LEFT JOIN faculty f ON t.id_faculty=f.id_faculty
       LEFT JOIN department d ON t.id_department=d.id_department
       WHERE t.id_teacher=?`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'ไม่พบข้อมูลอาจารย์' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /api/teachers
router.post('/', auth([1, 2]), async (req, res, next) => {
  try {
    const { id_teacher, id_user, id_title, id_academictitle, name_teacher, sname_teacher, initials_teacher, id_faculty, id_department, id_division, tel_teacher, email_teacher } = req.body;
    await pool.query(
      'INSERT INTO teacher (id_teacher,id_user,id_title,id_academictitle,name_teacher,sname_teacher,initials_teacher,id_faculty,id_department,id_division,tel_teacher,email_teacher) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [id_teacher, id_user, id_title, id_academictitle, name_teacher, sname_teacher, initials_teacher, id_faculty, id_department, id_division, tel_teacher, email_teacher]
    );
    res.status(201).json({ message: 'เพิ่มข้อมูลอาจารย์สำเร็จ' });
  } catch (err) { next(err); }
});

// PUT /api/teachers/:id
router.put('/:id', auth([1, 2, 3]), async (req, res, next) => {
  try {
    const { id_title, id_academictitle, name_teacher, sname_teacher, initials_teacher, id_faculty, id_department, id_division, tel_teacher, email_teacher } = req.body;
    await pool.query(
      'UPDATE teacher SET id_title=?,id_academictitle=?,name_teacher=?,sname_teacher=?,initials_teacher=?,id_faculty=?,id_department=?,id_division=?,tel_teacher=?,email_teacher=? WHERE id_teacher=?',
      [id_title, id_academictitle, name_teacher, sname_teacher, initials_teacher, id_faculty, id_department, id_division, tel_teacher, email_teacher, req.params.id]
    );
    res.json({ message: 'แก้ไขข้อมูลอาจารย์สำเร็จ' });
  } catch (err) { next(err); }
});

// DELETE /api/teachers/:id
router.delete('/:id', auth([1, 2]), async (req, res, next) => {
  try {
    await pool.query('DELETE FROM teacher WHERE id_teacher=?', [req.params.id]);
    res.json({ message: 'ลบข้อมูลอาจารย์สำเร็จ' });
  } catch (err) { next(err); }
});

module.exports = router;
