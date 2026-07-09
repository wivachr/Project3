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
      `SELECT s.*, t.name_title, f.name_faculty, d.name_department, di.name_division, c.name_curr
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

// GET /api/students/check/:id — public check (for project registration form)
// Returns: student info + is_registered (current year/sem) + has_active_project + old_project (if any)
router.get('/check/:id', async (req, res, next) => {
  try {
    const id = req.params.id;

    // 1. Student exists?
    const [rows] = await pool.query(
      `SELECT s.id_student, s.name_student, s.sname_student, ti.name_title,
              f.name_faculty, d.name_department
       FROM student s
       LEFT JOIN title ti ON s.id_title=ti.id_title
       LEFT JOIN faculty f ON s.id_faculty=f.id_faculty
       LEFT JOIN department d ON s.id_department=d.id_department
       WHERE s.id_student=?`, [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'ไม่พบรหัสนักศึกษา' });

    // 2. Current academic year
    const [[ay]] = await pool.query('SELECT year, semester FROM academicyear LIMIT 1');
    const { year, semester } = ay;

    // 3. Registered in current year/semester? (isregis.php)
    const [[reg]] = await pool.query(
      `SELECT r.year_registration, r.semester_registration, r.section, r.id_subject,
              s.name_student, s.sname_student
       FROM registration r JOIN student s ON s.id_student=r.id_student
       WHERE r.id_student=? AND r.year_registration=? AND r.semester_registration=?`,
      [id, year, semester]
    );

    // 4. Active project in current year/semester? (canuse.php)
    const [[active]] = await pool.query(
      `SELECT p.id_project FROM project p JOIN manipulator m ON m.id_project=p.id_project
       WHERE m.id_student=? AND p.year_project=? AND p.semester_project=?
         AND p.id_statusproject NOT IN (0, 18)`,
      [id, year, semester]
    );

    // 5. Old completed project from previous year/semester? (isold.php)
    let old_project = null;
    if (reg) {
      const [[old]] = await pool.query(
        `SELECT p.id_project, p.name_project, p.casestudy_project,
                p.engname_project, p.engcasestudy_project,
                p.year_project, p.semester_project, p.id_subject
         FROM project p JOIN manipulator m ON m.id_project=p.id_project
         WHERE m.id_student=? AND p.id_statusproject=16
           AND (p.year_project<>? OR p.semester_project<>?)
         LIMIT 1`,
        [id, year, semester]
      );
      if (old) old_project = old;
    }

    // 6. Eligible "year project round 2" parent? (checkyearproject.php) — a 'year'-type project,
    // not itself already a round-2 (parent_project_id IS NULL), that has passed the title exam,
    // has no round-2 registered against it yet, and is from a different semester than the current one.
    let year_project_option = null;
    const passedIn = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 19, 20, 21, 23, 24];
    const [[yp]] = await pool.query(
      `SELECT p.id_project, p.name_project, p.casestudy_project, p.engname_project, p.engcasestudy_project,
              p.year_project, p.semester_project, p.id_subject,
              CONCAT(at2.name_academictitle, t.name_teacher, ' ', t.sname_teacher) AS advisor_name
       FROM project p
       JOIN manipulator m ON m.id_project=p.id_project
       LEFT JOIN committee c ON c.id_project=p.id_project AND c.position='ที่ปรึกษา'
       LEFT JOIN teacher t ON c.id_teacher=t.id_teacher
       LEFT JOIN academictitle at2 ON t.id_academictitle=at2.id_academictitle
       WHERE m.id_student=? AND p.project_type='year' AND p.parent_project_id IS NULL
         AND p.id_statusproject IN (${passedIn.join(',')})
         AND NOT (p.year_project=? AND p.semester_project=?)
         AND NOT EXISTS (SELECT 1 FROM project p2 WHERE p2.parent_project_id=p.id_project)
       LIMIT 1`,
      [id, year, semester]
    );
    if (yp) year_project_option = yp;

    res.json({
      ...rows[0],
      is_registered: !!reg,
      registration: reg || null,
      has_active_project: !!active,
      old_project,
      year_project_option,
    });
  } catch (err) { next(err); }
});

// GET /api/students/:id
router.get('/:id', auth([1, 2, 4]), async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, t.name_title, f.name_faculty, d.name_department, di.name_division, c.name_curr
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

// POST /api/students/import — import CSV rows
// CSV format: id_student,id_title,name_student,sname_student,?,?,?,?,id_curr,id_faculty,id_department,id_division
router.post('/import', auth([1, 2]), async (req, res, next) => {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows) || !rows.length) return res.status(400).json({ message: 'ไม่มีข้อมูล' });
    let inserted = 0, skipped = 0;
    for (const r of rows) {
      try {
        await pool.query(
          'INSERT IGNORE INTO student (id_student,id_title,name_student,sname_student,id_curr,id_faculty,id_department,id_division) VALUES (?,?,?,?,?,?,?,?)',
          [r[0], r[1], r[2], r[3], r[8], r[9], r[10], r[11]]
        );
        inserted++;
      } catch { skipped++; }
    }
    res.json({ message: `นำเข้าสำเร็จ ${inserted} แถว, ข้าม ${skipped} แถว` });
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
