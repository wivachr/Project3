const router = require('express').Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

const table = (name, id, label) => async (req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT ${id} AS id, ${label} AS label FROM \`${name}\` ORDER BY ${id}`);
    res.json(rows);
  } catch (err) { next(err); }
};

router.get('/titles',         auth(), table('title',         'id_title',         'name_title'));
router.get('/academic-titles',auth(), table('academictitle', 'id_academictitle', 'name_academictitle'));
router.get('/faculties',      auth(), table('faculty',       'id_faculty',       'name_faculty'));
router.get('/departments',    auth(), table('department',    'id_department',    'name_department'));
router.get('/divisions',      auth(), table('division',      'id_division',      'name_division'));
router.get('/curriculums',    auth(), table('curriculum',    'id_curr',          'name_curriculum'));
router.get('/subjects',       auth(), table('subject',       'id_subject',       'name_subject'));
router.get('/rooms',          auth(), table('room',          'id_room',          'name_room'));
router.get('/type-exams',     auth(), table('typeexam',      'id_typeexam',      'name_typeexam'));
router.get('/status-projects',auth(), table('statusproject', 'id_statusproject', 'name_statusproject'));
router.get('/rights',         auth([1]), table('right',      'id_right',         'name_right'));

// GET /api/lookups/academic-year — public so login page and banner can read it
router.get('/academic-year', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM academicyear LIMIT 1');
    res.json(rows[0] || {});
  } catch (err) { next(err); }
});

// PUT /api/lookups/academic-year
router.put('/academic-year', auth([1, 2]), async (req, res, next) => {
  try {
    const { year, semester } = req.body;
    await pool.query('UPDATE academicyear SET year=?, semester=?', [year, semester]);
    res.json({ message: 'เปลี่ยนปีการศึกษาสำเร็จ' });
  } catch (err) { next(err); }
});

// --- Admin CRUD for basic data tables ---

const crudTable = (name, idCol, fields) => {
  router.post(`/${name}`, auth([1]), async (req, res, next) => {
    try {
      const vals = fields.map(f => req.body[f] ?? '');
      await pool.query(`INSERT INTO \`${name}\` (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`, vals);
      res.status(201).json({ message: 'เพิ่มข้อมูลสำเร็จ' });
    } catch (err) { next(err); }
  });
  router.put(`/${name}/:id`, auth([1]), async (req, res, next) => {
    try {
      const sets = fields.map(f => `${f}=?`).join(',');
      const vals = [...fields.map(f => req.body[f] ?? ''), req.params.id];
      await pool.query(`UPDATE \`${name}\` SET ${sets} WHERE ${idCol}=?`, vals);
      res.json({ message: 'แก้ไขข้อมูลสำเร็จ' });
    } catch (err) { next(err); }
  });
  router.delete(`/${name}/:id`, auth([1]), async (req, res, next) => {
    try {
      await pool.query(`DELETE FROM \`${name}\` WHERE ${idCol}=?`, [req.params.id]);
      res.json({ message: 'ลบข้อมูลสำเร็จ' });
    } catch (err) { next(err); }
  });
};

// GET detail for admin basic data (full rows)
const detailTable = (name, idCol) => {
  router.get(`/${name}/all`, auth([1]), async (req, res, next) => {
    try {
      const [rows] = await pool.query(`SELECT * FROM \`${name}\` ORDER BY ${idCol}`);
      res.json(rows);
    } catch (err) { next(err); }
  });
};

detailTable('title',        'id_title');
detailTable('academictitle','id_academictitle');
detailTable('faculty',      'id_faculty');
detailTable('department',   'id_department');
detailTable('division',     'id_division');
detailTable('curriculum',   'id_curr');
detailTable('subject',      'id_subject');
detailTable('room',         'id_room');
detailTable('typeexam',     'id_typeexam');
detailTable('statusproject','id_statusproject');

crudTable('title',        'id_title',        ['name_title']);
crudTable('academictitle','id_academictitle', ['name_academictitle', 'initials_academictitle']);
crudTable('faculty',      'id_faculty',       ['name_faculty', 'initials_faculty']);
crudTable('department',   'id_department',    ['name_department', 'initials_department', 'id_faculty']);
crudTable('division',     'id_division',      ['name_division', 'initials_division', 'id_faculty', 'id_department']);
crudTable('curriculum',   'id_curr',          ['name_curr']);
crudTable('subject',      'id_subject',       ['name_subject', 'credits']);
crudTable('room',         'id_room',          ['name_room']);
crudTable('typeexam',     'id_typeexam',      ['name_typeexam']);
crudTable('statusproject','id_statusproject', ['name_statusproject']);

module.exports = router;
