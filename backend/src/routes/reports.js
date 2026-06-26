const router = require('express').Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/reports/no-project — students registered this year/sem without a project
router.get('/no-project', auth([1, 2]), async (req, res, next) => {
  try {
    const [[ay]] = await pool.query('SELECT year, semester FROM academicyear LIMIT 1');
    const { year, semester } = ay;
    const [rows] = await pool.query(
      `SELECT DISTINCT ti.name_title, s.id_student, s.name_student, s.sname_student
       FROM student s
       JOIN registration r ON s.id_student=r.id_student
         AND r.year_registration=? AND r.semester_registration=?
       JOIN title ti ON s.id_title=ti.id_title
       WHERE s.id_student NOT IN (
         SELECT m.id_student FROM manipulator m
         JOIN project p ON m.id_project=p.id_project
         WHERE p.year_project=? AND p.semester_project=?
           AND p.id_statusproject NOT IN (0, 18)
       )
       ORDER BY s.id_student`,
      [year, semester, year, semester]
    );
    res.json({ year, semester, data: rows });
  } catch (err) { next(err); }
});

// GET /api/reports/no-exam — projects not yet submitted 100% exam (past their year/sem)
router.get('/no-exam', auth([1, 2]), async (req, res, next) => {
  try {
    const [[ay]] = await pool.query('SELECT year, semester FROM academicyear LIMIT 1');
    const { year, semester } = ay;
    const [rows] = await pool.query(
      `SELECT p.id_project, p.name_project, p.year_project, p.semester_project, sp.name_statusproject
       FROM project p
       JOIN statusproject sp ON p.id_statusproject=sp.id_statusproject
       WHERE (p.year_project<>? OR p.semester_project<>?)
         AND p.id_statusproject NOT IN (0, 16, 17, 18, 25, 14)
       ORDER BY p.year_project, p.id_project`,
      [year, semester]
    );
    res.json({ year, semester, data: rows });
  } catch (err) { next(err); }
});

// GET /api/reports/fall-project?year=&semester= — projects that failed title exam
router.get('/fall-project', auth([1, 2]), async (req, res, next) => {
  try {
    const year = req.query.year || '';
    const semester = req.query.semester || '';

    const conditions = ['e.id_typeexam=1', 'e.id_statusproject IN (22, 17, 25)'];
    const params = [];
    if (year) { conditions.push('e.year_exam=?'); params.push(year); }
    if (semester) { conditions.push('e.semester_exam=?'); params.push(semester); }
    const where = 'WHERE ' + conditions.join(' AND ');

    const [rows] = await pool.query(
      `SELECT p.id_project, p.name_project, p.year_project, p.semester_project,
              sp.name_statusproject, e.date_submitexam, e.comment_exam
       FROM exam e
       JOIN project p ON e.id_project=p.id_project
       JOIN statusproject sp ON e.id_statusproject=sp.id_statusproject
       ${where}
       ORDER BY e.date_submitexam DESC`,
      params
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/reports/case-study?year=&semester= — projects with case study text
router.get('/case-study', auth([1, 2]), async (req, res, next) => {
  try {
    const [[ay]] = await pool.query('SELECT year, semester FROM academicyear LIMIT 1');
    const year = req.query.year || ay.year;
    const semester = req.query.semester || ay.semester;
    const [rows] = await pool.query(
      `SELECT p.id_project, p.name_project, p.casestudy_project, p.year_project, p.semester_project,
              sp.name_statusproject
       FROM project p
       JOIN statusproject sp ON p.id_statusproject=sp.id_statusproject
       WHERE p.casestudy_project IS NOT NULL AND p.casestudy_project != ''
         AND p.year_project=? AND p.semester_project=?
       ORDER BY p.id_project`,
      [year, semester]
    );
    res.json({ year, semester, data: rows });
  } catch (err) { next(err); }
});

// GET /api/reports/expired — projects running >2 semesters without completion
router.get('/expired', auth([1, 2]), async (req, res, next) => {
  try {
    const [[ay]] = await pool.query('SELECT year, semester FROM academicyear LIMIT 1');
    const { year, semester } = ay;
    const [rows] = await pool.query(
      `SELECT p.id_project, p.name_project, p.year_project, p.semester_project,
              sp.name_statusproject,
              GROUP_CONCAT(DISTINCT CONCAT(at2.name_academictitle, t.name_teacher, ' ', t.sname_teacher)) AS advisors,
              GROUP_CONCAT(DISTINCT CONCAT(s.name_student, ' ', s.sname_student)) AS members
       FROM project p
       JOIN statusproject sp ON p.id_statusproject=sp.id_statusproject
       LEFT JOIN committee c ON c.id_project=p.id_project AND c.position='ที่ปรึกษา'
       LEFT JOIN teacher t ON c.id_teacher=t.id_teacher
       LEFT JOIN academictitle at2 ON t.id_academictitle=at2.id_academictitle
       LEFT JOIN manipulator m ON m.id_project=p.id_project
       LEFT JOIN student s ON m.id_student=s.id_student
       WHERE (((?-p.year_project)*2 + ?)-p.semester_project) > 1
         AND p.id_statusproject NOT IN (0, 12, 13, 14, 16, 17, 18)
       GROUP BY p.id_project
       ORDER BY p.year_project, p.id_project`,
      [year, semester]
    );
    res.json({ year, semester, data: rows });
  } catch (err) { next(err); }
});

module.exports = router;
