const router = require('express').Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

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

    const conditions = [];
    const params = [];
    if (typeexam) { conditions.push('e.id_typeexam=?'); params.push(typeexam); }
    if (key) { conditions.push('(p.name_project LIKE ? OR p.id_project LIKE ?)'); params.push(`%${key}%`, `%${key}%`); }
    if (year) { conditions.push('e.year_exam=?'); params.push(year); }
    if (semester) { conditions.push('e.semester_exam=?'); params.push(semester); }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM exam e JOIN project p ON e.id_project=p.id_project ${where}`, params
    );
    const [rows] = await pool.query(
      `SELECT e.*, p.name_project, p.engname_project, te.name_typeexam,
              sp.name_statusproject, ae.date_assignexam, ae.time_assignexam,
              ae.endtime_assignexam, ae.id_room, r.name_room
       FROM exam e
       JOIN project p ON e.id_project=p.id_project
       JOIN typeexam te ON e.id_typeexam=te.id_typeexam
       JOIN statusproject sp ON e.id_statusproject=sp.id_statusproject
       LEFT JOIN assignexam ae ON ae.id_exam=e.id_exam
       LEFT JOIN room r ON ae.id_room=r.id_room
       ${where}
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
    res.json({ message: 'กำหนดวันสอบสำเร็จ' });
  } catch (err) { next(err); }
});

// POST /api/exams/:id/approve — officer approves exam request
router.post('/:id/approve', auth([2]), async (req, res, next) => {
  try {
    const { id_statusproject } = req.body;
    await pool.query('UPDATE exam SET id_statusproject=? WHERE id_exam=?', [id_statusproject, req.params.id]);
    const [[exam]] = await pool.query('SELECT id_project FROM exam WHERE id_exam=?', [req.params.id]);
    if (exam) await pool.query('UPDATE project SET id_statusproject=? WHERE id_project=?', [id_statusproject, exam.id_project]);
    res.json({ message: 'อนุมัติการสอบสำเร็จ' });
  } catch (err) { next(err); }
});

// POST /api/exams/:id/result — officer saves exam result (via status only, no result column)
router.post('/:id/result', auth([2]), async (req, res, next) => {
  try {
    const { id_statusproject, comment_exam } = req.body;
    await pool.query(
      'UPDATE exam SET id_statusproject=?, comment_exam=? WHERE id_exam=?',
      [id_statusproject, comment_exam || '', req.params.id]
    );
    const [examRow] = await pool.query('SELECT id_project, id_typeexam FROM exam WHERE id_exam=?', [req.params.id]);
    if (examRow.length) {
      // map exam status to project status
      const examStatus = parseInt(id_statusproject);
      let projStatus = id_statusproject;
      if (examStatus === 24) { // ผ่าน → map to project pass status by typeexam
        const typeexam = examRow[0].id_typeexam;
        if (typeexam === 1) projStatus = 15; // สอบหัวข้อผ่าน
        else if (typeexam === 2) projStatus = 10; // สอบ60ผ่าน
        else if (typeexam === 3) projStatus = 14; // สอบ100ผ่าน
      } else if (examStatus === 22) { // ไม่ผ่าน
        projStatus = 17;
      }
      await pool.query('UPDATE project SET id_statusproject=? WHERE id_project=?', [projStatus, examRow[0].id_project]);
    }
    res.json({ message: 'บันทึกผลการสอบสำเร็จ' });
  } catch (err) { next(err); }
});

module.exports = router;
