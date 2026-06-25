const router = require('express').Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const PROJECT_COLS = `
  p.*, sp.name_statusproject, s.name_subject,
  GROUP_CONCAT(DISTINCT CONCAT(at2.name_academictitle,t2.name_title,t.name_teacher,' ',t.sname_teacher) ORDER BY c.position SEPARATOR ', ') AS advisors,
  GROUP_CONCAT(DISTINCT CONCAT(st.name_student,' ',st.sname_student) SEPARATOR ', ') AS members
`;
const PROJECT_JOINS = `
  LEFT JOIN statusproject sp ON p.id_statusproject=sp.id_statusproject
  LEFT JOIN subject s ON p.id_subject=s.id_subject
  LEFT JOIN committee c ON c.id_project=p.id_project
  LEFT JOIN teacher t ON c.id_teacher=t.id_teacher
  LEFT JOIN title t2 ON t.id_title=t2.id_title
  LEFT JOIN academictitle at2 ON t.id_academictitle=at2.id_academictitle
  LEFT JOIN manipulator m ON m.id_project=p.id_project
  LEFT JOIN student st ON m.id_student=st.id_student
`;

// GET /api/projects?page=1&limit=20&key=&status=
router.get('/', auth([1, 2, 3]), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const key = req.query.key || '';
    const status = req.query.status || '';
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];
    if (key) { conditions.push('(p.name_project LIKE ? OR p.engname_project LIKE ? OR p.id_project LIKE ?)'); params.push(`%${key}%`, `%${key}%`, `%${key}%`); }
    if (status) { conditions.push('p.id_statusproject=?'); params.push(status); }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM project p ${where}`, params);
    const [rows] = await pool.query(
      `SELECT ${PROJECT_COLS} FROM project p ${PROJECT_JOINS} ${where}
       GROUP BY p.id_project ORDER BY p.id_project DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    res.json({ data: rows, total, page, limit });
  } catch (err) { next(err); }
});

// GET /api/projects/teacher — teacher's own advisory projects
router.get('/teacher', auth([3]), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const key = req.query.key || '';
    const offset = (page - 1) * limit;
    const keyWhere = key ? 'AND (p.name_project LIKE ? OR p.id_project LIKE ?)' : '';
    const keyParams = key ? [`%${key}%`, `%${key}%`] : [];

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM project p
       JOIN committee c ON c.id_project=p.id_project AND c.position='ที่ปรึกษา'
       JOIN teacher t ON c.id_teacher=t.id_teacher
       WHERE t.id_user=? ${keyWhere}`, [req.user.iduser, ...keyParams]
    );
    const [rows] = await pool.query(
      `SELECT p.*, sp.name_statusproject,
              GROUP_CONCAT(DISTINCT CONCAT(st.name_student,' ',st.sname_student) SEPARATOR ', ') AS members
       FROM project p
       JOIN committee c ON c.id_project=p.id_project AND c.position='ที่ปรึกษา'
       JOIN teacher t ON c.id_teacher=t.id_teacher
       JOIN statusproject sp ON p.id_statusproject=sp.id_statusproject
       LEFT JOIN manipulator m ON m.id_project=p.id_project
       LEFT JOIN student st ON m.id_student=st.id_student
       WHERE t.id_user=? ${keyWhere}
       GROUP BY p.id_project ORDER BY p.id_project DESC LIMIT ? OFFSET ?`,
      [req.user.iduser, ...keyParams, limit, offset]
    );
    res.json({ data: rows, total, page, limit });
  } catch (err) { next(err); }
});

// GET /api/projects/my — student's own project (linked via project.id_user)
router.get('/my', auth([4]), async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, sp.name_statusproject, s.name_subject
       FROM project p
       LEFT JOIN statusproject sp ON p.id_statusproject=sp.id_statusproject
       LEFT JOIN subject s ON p.id_subject=s.id_subject
       WHERE p.id_user=?`, [req.user.iduser]
    );
    if (!rows.length) return res.json(null);
    const project = rows[0];

    const [members] = await pool.query(
      `SELECT m.*, s.name_student, s.sname_student, ti.name_title
       FROM manipulator m
       LEFT JOIN student s ON m.id_student=s.id_student
       LEFT JOIN title ti ON s.id_title=ti.id_title
       WHERE m.id_project=?`, [project.id_project]
    );
    const [committee] = await pool.query(
      `SELECT c.*, t.name_teacher, t.sname_teacher, ti.name_title, at2.name_academictitle
       FROM committee c
       JOIN teacher t ON c.id_teacher=t.id_teacher
       LEFT JOIN title ti ON t.id_title=ti.id_title
       LEFT JOIN academictitle at2 ON t.id_academictitle=at2.id_academictitle
       WHERE c.id_project=?`, [project.id_project]
    );
    const [coadvisors] = await pool.query(
      `SELECT co.*, ti.name_title FROM coadvisor co
       LEFT JOIN title ti ON co.id_title=ti.id_title
       WHERE co.id_project=?`, [project.id_project]
    );
    res.json({ ...project, members, committee, manipulators: members, coadvisors });
  } catch (err) { next(err); }
});

// GET /api/projects/my/history — student's project edit history
router.get('/my/history', auth([4]), async (req, res, next) => {
  try {
    const [[proj]] = await pool.query('SELECT id_project FROM project WHERE id_user=?', [req.user.iduser]);
    if (!proj) return res.json([]);
    const [rows] = await pool.query(
      'SELECT * FROM projecthistory WHERE id_project=? ORDER BY date_edit DESC',
      [proj.id_project]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/projects/book-list — projects with status 14 (สอบร้อยผ่านแล้ว) waiting for book submission
router.get('/book-list', auth([1, 2]), async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id_project, p.name_project, p.engname_project,
             p.casestudy_project, p.engcasestudy_project,
             p.address_project, p.email_project, p.torgor_project,
             sp.name_statusproject,
             GROUP_CONCAT(DISTINCT CONCAT(ti.name_title, s.name_student, ' ', s.sname_student, '|', IFNULL(m.tel_manipulator,''))
               ORDER BY m.id_manipulator SEPARATOR ';;') AS members_raw,
             GROUP_CONCAT(DISTINCT CONCAT(at2.name_academictitle, t.name_teacher, ' ', t.sname_teacher)
               ORDER BY c.id_committee SEPARATOR ', ') AS advisors,
             (SELECT CONCAT(at3.name_academictitle, t3.name_teacher, ' ', t3.sname_teacher)
              FROM committee c3 JOIN teacher t3 ON c3.id_teacher=t3.id_teacher
              JOIN academictitle at3 ON t3.id_academictitle=at3.id_academictitle
              WHERE c3.id_project=p.id_project AND c3.position='ประธาน' LIMIT 1) AS chairman,
             GROUP_CONCAT(DISTINCT CONCAT(at4.name_academictitle, t4.name_teacher, ' ', t4.sname_teacher)
               ORDER BY c4.id_committee SEPARATOR ', ') AS committees,
             (SELECT CONCAT(co_ti.name_title, co.name_coadvisor, ' ', co.sname_coadvisor)
              FROM coadvisor co JOIN title co_ti ON co.id_title=co_ti.id_title
              WHERE co.id_project=p.id_project LIMIT 1) AS coadvisor
      FROM project p
      LEFT JOIN statusproject sp ON p.id_statusproject=sp.id_statusproject
      LEFT JOIN manipulator m ON m.id_project=p.id_project
      LEFT JOIN student s ON m.id_student=s.id_student
      LEFT JOIN title ti ON s.id_title=ti.id_title
      LEFT JOIN committee c ON c.id_project=p.id_project AND c.position='ที่ปรึกษา'
      LEFT JOIN teacher t ON c.id_teacher=t.id_teacher
      LEFT JOIN academictitle at2 ON t.id_academictitle=at2.id_academictitle
      LEFT JOIN committee c4 ON c4.id_project=p.id_project AND c4.position='กรรมการ'
      LEFT JOIN teacher t4 ON c4.id_teacher=t4.id_teacher
      LEFT JOIN academictitle at4 ON t4.id_academictitle=at4.id_academictitle
      WHERE p.id_statusproject = 14
      GROUP BY p.id_project
      ORDER BY p.id_project
    `);
    const data = rows.map(r => ({
      ...r,
      members: r.members_raw
        ? r.members_raw.split(';;').map(s => { const [name, tel] = s.split('|'); return { name, tel }; })
        : [],
    }));
    res.json(data);
  } catch (err) { next(err); }
});

// GET /api/projects/:id
router.get('/:id', auth([1, 2, 3, 4]), async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, sp.name_statusproject, s.name_subject FROM project p
       LEFT JOIN statusproject sp ON p.id_statusproject=sp.id_statusproject
       LEFT JOIN subject s ON p.id_subject=s.id_subject
       WHERE p.id_project=?`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'ไม่พบข้อมูลโปรเจกต์' });

    const [committee] = await pool.query(
      `SELECT c.*, t.name_teacher, t.sname_teacher, ti.name_title, at2.name_academictitle
       FROM committee c
       JOIN teacher t ON c.id_teacher=t.id_teacher
       LEFT JOIN title ti ON t.id_title=ti.id_title
       LEFT JOIN academictitle at2 ON t.id_academictitle=at2.id_academictitle
       WHERE c.id_project=?`, [req.params.id]
    );
    const [members] = await pool.query(
      `SELECT m.*, s.name_student, s.sname_student, ti.name_title
       FROM manipulator m
       LEFT JOIN student s ON m.id_student=s.id_student
       LEFT JOIN title ti ON s.id_title=ti.id_title
       WHERE m.id_project=?`, [req.params.id]
    );
    const [exams] = await pool.query(
      `SELECT e.*, te.name_typeexam, sp2.name_statusproject AS exam_status
       FROM exam e
       JOIN typeexam te ON e.id_typeexam=te.id_typeexam
       JOIN statusproject sp2 ON e.id_statusproject=sp2.id_statusproject
       WHERE e.id_project=? ORDER BY e.date_submitexam DESC`, [req.params.id]
    );

    res.json({ ...rows[0], committee, members, exams });
  } catch (err) { next(err); }
});

// POST /api/projects — student creates project (id_project = username)
router.post('/', auth([4]), async (req, res, next) => {
  try {
    const { id_subject, name_project, engname_project, casestudy_project, engcasestudy_project,
            address_project, email_project, year_project, semester_project, section_project } = req.body;
    // username = project ID for student accounts
    const id_project = req.user.username;
    const [existing] = await pool.query('SELECT id_project FROM project WHERE id_user=?', [req.user.iduser]);
    if (existing.length) return res.status(400).json({ message: 'มีโครงการอยู่แล้ว' });

    await pool.query(
      `INSERT INTO project (id_project,id_user,id_subject,id_statusproject,name_project,engname_project,
        casestudy_project,engcasestudy_project,address_project,email_project,year_project,semester_project,section_project)
       VALUES (?,?,?,1,?,?,?,?,?,?,?,?,?)`,
      [id_project, req.user.iduser, id_subject, name_project, engname_project,
       casestudy_project, engcasestudy_project, address_project, email_project,
       year_project, semester_project, section_project]
    );
    res.status(201).json({ message: 'บันทึกข้อมูลโปรเจกต์สำเร็จ', id_project });
  } catch (err) { next(err); }
});

// PUT /api/projects/:id
router.put('/:id', auth([1, 2, 4]), async (req, res, next) => {
  try {
    const { id_subject, name_project, engname_project, casestudy_project, engcasestudy_project,
            address_project, email_project, year_project, semester_project, section_project } = req.body;
    await pool.query(
      `UPDATE project SET id_subject=?,name_project=?,engname_project=?,casestudy_project=?,
        engcasestudy_project=?,address_project=?,email_project=?,year_project=?,semester_project=?,section_project=?
       WHERE id_project=?`,
      [id_subject, name_project, engname_project, casestudy_project, engcasestudy_project,
       address_project, email_project, year_project, semester_project, section_project, req.params.id]
    );
    res.json({ message: 'แก้ไขข้อมูลโปรเจกต์สำเร็จ' });
  } catch (err) { next(err); }
});

// DELETE /api/projects/:id
router.delete('/:id', auth([1, 2]), async (req, res, next) => {
  try {
    await pool.query('DELETE FROM manipulator WHERE id_project=?', [req.params.id]);
    await pool.query('DELETE FROM committee WHERE id_project=?', [req.params.id]);
    await pool.query('DELETE FROM exam WHERE id_project=?', [req.params.id]);
    await pool.query('DELETE FROM project WHERE id_project=?', [req.params.id]);
    res.json({ message: 'ลบโครงการสำเร็จ' });
  } catch (err) { next(err); }
});

// POST /api/projects/:id/committee
router.post('/:id/committee', auth([1, 2]), async (req, res, next) => {
  try {
    const { id_teacher, position } = req.body;
    await pool.query('INSERT INTO committee (id_teacher,id_project,position) VALUES (?,?,?)', [id_teacher, req.params.id, position]);
    res.status(201).json({ message: 'เพิ่มกรรมการสำเร็จ' });
  } catch (err) { next(err); }
});

// DELETE /api/projects/:id/committee/:cid
router.delete('/:id/committee/:cid', auth([1, 2]), async (req, res, next) => {
  try {
    await pool.query('DELETE FROM committee WHERE id_committee=? AND id_project=?', [req.params.cid, req.params.id]);
    res.json({ message: 'ลบกรรมการสำเร็จ' });
  } catch (err) { next(err); }
});

// GET /api/projects/:id/members
router.get('/:id/members', auth([1, 2, 4]), async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.*, s.name_student, s.sname_student, ti.name_title
       FROM manipulator m
       LEFT JOIN student s ON m.id_student=s.id_student
       LEFT JOIN title ti ON s.id_title=ti.id_title
       WHERE m.id_project=?`, [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/projects/:id/members — add member
router.post('/:id/members', auth([4]), async (req, res, next) => {
  try {
    const { id_student, tel_manipulator } = req.body;
    const [existing] = await pool.query('SELECT 1 FROM student WHERE id_student=?', [id_student]);
    if (!existing.length) return res.status(404).json({ message: 'ไม่พบรหัสนักศึกษา' });
    await pool.query('INSERT INTO manipulator (id_student,id_project,tel_manipulator) VALUES (?,?,?)',
      [id_student, req.params.id, tel_manipulator || '']);
    res.status(201).json({ message: 'เพิ่มสมาชิกสำเร็จ' });
  } catch (err) { next(err); }
});

// DELETE /api/projects/:id/members/:mid
router.delete('/:id/members/:mid', auth([1, 2, 4]), async (req, res, next) => {
  try {
    await pool.query('DELETE FROM manipulator WHERE id_manipulator=? AND id_project=?', [req.params.mid, req.params.id]);
    res.json({ message: 'ลบสมาชิกสำเร็จ' });
  } catch (err) { next(err); }
});

// GET /api/projects/:id/coadvisors
router.get('/:id/coadvisors', auth([1, 2, 3, 4]), async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT co.*, ti.name_title FROM coadvisor co
       LEFT JOIN title ti ON co.id_title=ti.id_title
       WHERE co.id_project=?`, [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/projects/:id/coadvisors
router.post('/:id/coadvisors', auth([4]), async (req, res, next) => {
  try {
    const { id_title, name_coadvisor, sname_coadvisor } = req.body;
    if (!name_coadvisor || !sname_coadvisor) return res.status(400).json({ message: 'กรุณากรอกชื่อ-สกุล' });
    await pool.query(
      'INSERT INTO coadvisor (id_project,id_title,name_coadvisor,sname_coadvisor) VALUES (?,?,?,?)',
      [req.params.id, id_title || 1, name_coadvisor, sname_coadvisor]
    );
    res.status(201).json({ message: 'เพิ่มอาจารย์ที่ปรึกษาร่วมสำเร็จ' });
  } catch (err) { next(err); }
});

// DELETE /api/projects/:id/coadvisors/:cid
router.delete('/:id/coadvisors/:cid', auth([4]), async (req, res, next) => {
  try {
    await pool.query('DELETE FROM coadvisor WHERE id_coadvisor=? AND id_project=?', [req.params.cid, req.params.id]);
    res.json({ message: 'ลบอาจารย์ที่ปรึกษาร่วมสำเร็จ' });
  } catch (err) { next(err); }
});

// POST /api/projects/:id/submit-exam
router.post('/:id/submit-exam', auth([4]), async (req, res, next) => {
  try {
    const { id_typeexam } = req.body;
    // status: typeexam 1→2, 2→11, 3→14
    const statusMap = { 1: 2, 2: 11, 3: 14 };
    const id_statusproject = statusMap[id_typeexam] || 2;
    await pool.query(
      'INSERT INTO exam (id_project,id_typeexam,id_statusproject,date_submitexam) VALUES (?,?,?,NOW())',
      [req.params.id, id_typeexam, id_statusproject]
    );
    await pool.query('UPDATE project SET id_statusproject=? WHERE id_project=?', [id_statusproject, req.params.id]);
    res.status(201).json({ message: 'ส่งคำร้องขอสอบสำเร็จ' });
  } catch (err) { next(err); }
});

// GET /api/projects/book-list — projects with status 14 (สอบร้อยผ่านแล้ว) waiting for book submission
// POST /api/projects/:id/confirm-book — officer confirms book received → status 16
router.post('/:id/confirm-book', auth([1, 2]), async (req, res, next) => {
  try {
    await pool.query('UPDATE project SET id_statusproject=16 WHERE id_project=?', [req.params.id]);
    res.json({ message: 'ยืนยันการส่งปริญญานิพนธ์สำเร็จ' });
  } catch (err) { next(err); }
});

// POST /api/projects/:id/upload
router.post('/:id/upload', auth([4]), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'ไม่พบไฟล์' });
    const fileUrl = `/uploads/${req.file.filename}`;
    await pool.query('UPDATE project SET torgor_project=? WHERE id_project=?', [fileUrl, req.params.id]);
    res.json({ message: 'อัปโหลดไฟล์สำเร็จ', url: fileUrl });
  } catch (err) { next(err); }
});

module.exports = router;
