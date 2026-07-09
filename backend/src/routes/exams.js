const router = require('express').Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');
const { APPROVE_STATUS, ASSIGN_STATUS, EXAM_PENDING, EXAM_APPROVED, resolveResult } = require('../config/examStatus');

// GET /api/exams/my — student's own exam history
router.get('/my', auth([4]), async (req, res, next) => {
  try {
    const [[proj]] = await pool.query('SELECT id_project FROM project WHERE id_user=?', [req.user.iduser]);
    if (!proj) return res.json([]);
    const [rows] = await pool.query(
      `SELECT e.*, te.name_typeexam, sp.name_statusproject,
              ae.date_assignexam, ae.time_assignexam, ae.endtime_assignexam, r.name_room
       FROM exam e
       JOIN typeexam te ON e.id_typeexam=te.id_typeexam
       JOIN statusproject sp ON e.id_statusproject=sp.id_statusproject
       LEFT JOIN assignexam ae ON ae.id_exam=e.id_exam
       LEFT JOIN room r ON ae.id_room=r.id_room
       WHERE e.id_project=?
       ORDER BY e.date_submitexam DESC`, [proj.id_project]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/exams?page=1&typeexam=&key=
router.get('/', auth([1, 2, 3]), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const typeexam = req.query.typeexam || '';
    const key = req.query.key || '';
    const year = req.query.year || '';
    const semester = req.query.semester || '';
    const pending = req.query.pending || '';

    const conditions = [];
    const params = [];
    if (typeexam) { conditions.push('e.id_typeexam=?'); params.push(typeexam); }
    if (key) { conditions.push('(p.name_project LIKE ? OR p.id_project LIKE ?)'); params.push(`%${key}%`, `%${key}%`); }
    if (year) { conditions.push('e.year_exam=?'); params.push(year); }
    if (semester) { conditions.push('e.semester_exam=?'); params.push(semester); }
    if (pending) { conditions.push('e.id_statusproject=?'); params.push(EXAM_PENDING); }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM exam e JOIN project p ON e.id_project=p.id_project ${where}`, params
    );
    const [rows] = await pool.query(
      `SELECT e.*, p.name_project, p.engname_project, te.name_typeexam,
              sp.name_statusproject, ae.date_assignexam, ae.time_assignexam,
              ae.endtime_assignexam, ae.id_room, r.name_room, p.id_statusproject,
              GROUP_CONCAT(DISTINCT CONCAT(at2.name_academictitle,t.name_teacher,' ',t.sname_teacher) ORDER BY c.position SEPARATOR ', ') AS advisors,
              GROUP_CONCAT(DISTINCT CONCAT(st.name_student,' ',st.sname_student) SEPARATOR ', ') AS members
       FROM exam e
       JOIN project p ON e.id_project=p.id_project
       JOIN typeexam te ON e.id_typeexam=te.id_typeexam
       JOIN statusproject sp ON e.id_statusproject=sp.id_statusproject
       LEFT JOIN assignexam ae ON ae.id_exam=e.id_exam
       LEFT JOIN room r ON ae.id_room=r.id_room
       LEFT JOIN committee c ON c.id_project=p.id_project
       LEFT JOIN teacher t ON c.id_teacher=t.id_teacher
       LEFT JOIN title t2 ON t.id_title=t2.id_title
       LEFT JOIN academictitle at2 ON t.id_academictitle=at2.id_academictitle
       LEFT JOIN manipulator m ON m.id_project=p.id_project
       LEFT JOIN student st ON m.id_student=st.id_student
       ${where}
       GROUP BY e.id_exam
       ORDER BY e.date_submitexam DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    res.json({ data: rows, total, page, limit });
  } catch (err) { next(err); }
});

// GET /api/exams/:id
router.get('/:id', auth([1, 2, 3]), async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, p.name_project, te.name_typeexam, sp.name_statusproject,
              ae.date_assignexam, ae.time_assignexam, ae.endtime_assignexam, r.name_room
       FROM exam e
       JOIN project p ON e.id_project=p.id_project
       JOIN typeexam te ON e.id_typeexam=te.id_typeexam
       JOIN statusproject sp ON e.id_statusproject=sp.id_statusproject
       LEFT JOIN assignexam ae ON ae.id_exam=e.id_exam
       LEFT JOIN room r ON ae.id_room=r.id_room
       WHERE e.id_exam=?`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'ไม่พบข้อมูลการสอบ' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /api/exams/:id/assign — officer assigns date/room
router.post('/:id/assign', auth([2]), async (req, res, next) => {
  try {
    const { date_assignexam, time_assignexam, endtime_assignexam, id_room } = req.body;
    const [existing] = await pool.query('SELECT id_assignexam FROM assignexam WHERE id_exam=?', [req.params.id]);
    if (existing.length) {
      await pool.query(
        'UPDATE assignexam SET date_assignexam=?,time_assignexam=?,endtime_assignexam=?,id_room=? WHERE id_exam=?',
        [date_assignexam, time_assignexam, endtime_assignexam || '', id_room, req.params.id]
      );
    } else {
      await pool.query(
        'INSERT INTO assignexam (id_exam,date_assignexam,time_assignexam,endtime_assignexam,id_room) VALUES (?,?,?,?,?)',
        [req.params.id, date_assignexam, time_assignexam, endtime_assignexam || '', id_room]
      );
    }
    const [[exam]] = await pool.query('SELECT id_project, id_typeexam FROM exam WHERE id_exam=?', [req.params.id]);
    if (exam) {
      const projStatus = ASSIGN_STATUS[exam.id_typeexam];
      if (projStatus) await pool.query('UPDATE project SET id_statusproject=? WHERE id_project=?', [projStatus, exam.id_project]);
    }
    res.json({ message: 'กำหนดวันสอบสำเร็จ' });
  } catch (err) { next(err); }
});

// POST /api/exams/:id/approve — officer approves (รับเรื่อง) a pending exam request
router.post('/:id/approve', auth([2]), async (req, res, next) => {
  try {
    const [[exam]] = await pool.query('SELECT id_project, id_typeexam FROM exam WHERE id_exam=?', [req.params.id]);
    if (!exam) return res.status(404).json({ message: 'ไม่พบข้อมูลการสอบ' });
    const projStatus = APPROVE_STATUS[exam.id_typeexam];
    if (!projStatus) return res.status(400).json({ message: 'ประเภทการสอบไม่ถูกต้อง' });

    await pool.query('UPDATE exam SET id_statusproject=? WHERE id_exam=?', [EXAM_APPROVED, req.params.id]);
    await pool.query('UPDATE project SET id_statusproject=? WHERE id_project=?', [projStatus, exam.id_project]);
    res.json({ message: 'อนุมัติการสอบสำเร็จ' });
  } catch (err) { next(err); }
});

// POST /api/exams/:id/result — officer saves exam result
// body: { resultexam: 0=ไม่ผ่าน, 1=ผ่าน, 3=ไม่ผ่าน(F, 100%-exam only), comment_exam }
router.post('/:id/result', auth([2]), async (req, res, next) => {
  try {
    const { resultexam, comment_exam } = req.body;
    const [[exam]] = await pool.query('SELECT id_project, id_typeexam FROM exam WHERE id_exam=?', [req.params.id]);
    if (!exam) return res.status(404).json({ message: 'ไม่พบข้อมูลการสอบ' });

    const { exam_status, project_status, disableUser } = resolveResult(exam.id_typeexam, resultexam);

    await pool.query(
      'UPDATE exam SET id_statusproject=?, comment_exam=? WHERE id_exam=?',
      [exam_status, comment_exam || '', req.params.id]
    );
    await pool.query('UPDATE project SET id_statusproject=? WHERE id_project=?', [project_status, exam.id_project]);
    if (disableUser) {
      const [[proj]] = await pool.query('SELECT id_user FROM project WHERE id_project=?', [exam.id_project]);
      if (proj) await pool.query('UPDATE user SET status_user=0 WHERE id_user=?', [proj.id_user]);
    }
    res.json({ message: 'บันทึกผลการสอบสำเร็จ' });
  } catch (err) { next(err); }
});

module.exports = router;
