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

module.exports = router;
