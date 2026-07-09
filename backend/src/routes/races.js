const router = require('express').Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/races?page=1&limit=20&key= — officer-managed module, no teacher/student page uses this
router.get('/', auth([1, 2]), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const key = req.query.key || '';
    const offset = (page - 1) * limit;
    const where = key ? 'WHERE (r.location_race LIKE ? OR r.status_race LIKE ? OR p.name_project LIKE ?)' : '';
    const params = key ? [`%${key}%`, `%${key}%`, `%${key}%`] : [];

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM race r LEFT JOIN project p ON r.id_project=p.id_project ${where}`, params
    );
    const [rows] = await pool.query(
      `SELECT r.*, p.name_project FROM race r
       LEFT JOIN project p ON r.id_project=p.id_project
       ${where} ORDER BY r.id_race DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    res.json({ data: rows, total, page, limit });
  } catch (err) { next(err); }
});

// POST /api/races
router.post('/', auth([1, 2]), async (req, res, next) => {
  try {
    const { id_project, location_race, status_race } = req.body;
    if (!id_project || !location_race) return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ' });
    await pool.query(
      'INSERT INTO race (id_project, location_race, status_race) VALUES (?,?,?)',
      [id_project, location_race, status_race || '']
    );
    res.status(201).json({ message: 'เพิ่มข้อมูลการแข่งขันสำเร็จ' });
  } catch (err) { next(err); }
});

// PUT /api/races/:id
router.put('/:id', auth([1, 2]), async (req, res, next) => {
  try {
    const { id_project, location_race, status_race } = req.body;
    await pool.query(
      'UPDATE race SET id_project=?, location_race=?, status_race=? WHERE id_race=?',
      [id_project, location_race, status_race || '', req.params.id]
    );
    res.json({ message: 'แก้ไขข้อมูลการแข่งขันสำเร็จ' });
  } catch (err) { next(err); }
});

// DELETE /api/races/:id
router.delete('/:id', auth([1, 2]), async (req, res, next) => {
  try {
    await pool.query('DELETE FROM race WHERE id_race=?', [req.params.id]);
    res.json({ message: 'ลบข้อมูลการแข่งขันสำเร็จ' });
  } catch (err) { next(err); }
});

module.exports = router;
