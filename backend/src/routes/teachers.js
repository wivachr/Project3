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
       WHERE 1 ${where} ORDER BY t.id_teacher DESC LIMIT ? OFFSET ?`,
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

// GET /api/teachers/freetime-all — officer views all teacher freetimes
router.get('/freetime-all', auth([1, 2]), async (req, res, next) => {
  try {
    const [teachers] = await pool.query(
      `SELECT t.id_teacher, t.name_teacher, t.sname_teacher, at2.name_academictitle
       FROM teacher t
       LEFT JOIN academictitle at2 ON t.id_academictitle=at2.id_academictitle
       WHERE t.name_teacher IS NOT NULL AND t.name_teacher != ''
       ORDER BY t.name_teacher`
    );
    const [slots] = await pool.query('SELECT * FROM teacherfreetime');
    const map = {};
    for (const s of slots) {
      if (!map[s.id_teacher]) map[s.id_teacher] = [];
      map[s.id_teacher].push({ day: s.day_freetime, time: s.time_freetime });
    }
    res.json(teachers.map(t => ({ ...t, slots: map[t.id_teacher] || [] })));
  } catch (err) { next(err); }
});

// GET /api/teachers/freetime — teacher's own freetime (Teacher only)
router.get('/freetime', auth([3]), async (req, res, next) => {
  try {
    const [[me]] = await pool.query('SELECT id_teacher FROM teacher WHERE id_user=?', [req.user.iduser]);
    if (!me) return res.json([]);
    const [rows] = await pool.query(
      'SELECT day_freetime, time_freetime FROM teacherfreetime WHERE id_teacher=?', [me.id_teacher]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// PUT /api/teachers/freetime — replace all freetime entries for current teacher
router.put('/freetime', auth([3]), async (req, res, next) => {
  try {
    const [[me]] = await pool.query('SELECT id_teacher FROM teacher WHERE id_user=?', [req.user.iduser]);
    if (!me) return res.status(404).json({ message: 'ไม่พบข้อมูลอาจารย์' });
    const { slots } = req.body; // array of { day, time }
    await pool.query('DELETE FROM teacherfreetime WHERE id_teacher=?', [me.id_teacher]);
    if (slots && slots.length > 0) {
      const values = slots.map(s => [s.day, s.time, me.id_teacher]);
      await pool.query('INSERT INTO teacherfreetime (day_freetime,time_freetime,id_teacher) VALUES ?', [values]);
    }
    res.json({ message: 'บันทึกเวลาว่างสำเร็จ' });
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

// PUT /api/teachers/:id — admin/officer may edit any teacher; a teacher may only edit their own row
router.put('/:id', auth([1, 2, 3]), async (req, res, next) => {
  try {
    if (req.user.right === 3) {
      const [[me]] = await pool.query('SELECT id_teacher FROM teacher WHERE id_user=?', [req.user.iduser]);
      if (!me || String(me.id_teacher) !== String(req.params.id)) {
        return res.status(403).json({ message: 'ไม่มีสิทธิ์แก้ไขข้อมูลอาจารย์ท่านอื่น' });
      }
    }
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
