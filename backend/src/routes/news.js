const router = require('express').Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM news ORDER BY id_news DESC LIMIT 20');
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', auth([1, 2]), async (req, res, next) => {
  try {
    const { topic_news, detail_news } = req.body;
    await pool.query('INSERT INTO news (topic_news,detail_news,date_news) VALUES (?,?,NOW())', [topic_news, detail_news]);
    res.status(201).json({ message: 'เพิ่มข่าวสำเร็จ' });
  } catch (err) { next(err); }
});

router.put('/:id', auth([1, 2]), async (req, res, next) => {
  try {
    const { topic_news, detail_news } = req.body;
    await pool.query('UPDATE news SET topic_news=?,detail_news=? WHERE id_news=?', [topic_news, detail_news, req.params.id]);
    res.json({ message: 'แก้ไขข่าวสำเร็จ' });
  } catch (err) { next(err); }
});

router.delete('/:id', auth([1, 2]), async (req, res, next) => {
  try {
    await pool.query('DELETE FROM news WHERE id_news=?', [req.params.id]);
    res.json({ message: 'ลบข่าวสำเร็จ' });
  } catch (err) { next(err); }
});

module.exports = router;
