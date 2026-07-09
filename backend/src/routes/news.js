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
const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.gif'];

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM news ORDER BY id_news DESC LIMIT 20');
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', auth([1, 2]), async (req, res, next) => {
  try {
    const { topic_news, detail_news } = req.body;
    const [[{ maxId }]] = await pool.query('SELECT COALESCE(MAX(id_news), 0) AS maxId FROM news');
    const now = new Date(Date.now() + 7 * 60 * 60 * 1000); // UTC+7
    const beYear = now.getUTCFullYear() + 543;
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const dateNews = `${beYear}-${month}-${day}`;
    await pool.query(
      'INSERT INTO news (id_news,topic_news,detail_news,date_news,id_user) VALUES (?,?,?,?,?)',
      [maxId + 1, topic_news, detail_news, dateNews, req.user.iduser]
    );
    res.status(201).json({ message: 'เพิ่มข่าวสำเร็จ', id_news: maxId + 1 });
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

// POST /api/news/:id/upload-pdf
router.post('/:id/upload-pdf', auth([1, 2]), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'ไม่พบไฟล์' });
    if (path.extname(req.file.originalname).toLowerCase() !== '.pdf') {
      return res.status(400).json({ message: 'อนุญาตเฉพาะไฟล์ PDF เท่านั้น' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    await pool.query('UPDATE news SET pdf_news=? WHERE id_news=?', [fileUrl, req.params.id]);
    res.json({ message: 'อัปโหลด PDF สำเร็จ', url: fileUrl });
  } catch (err) { next(err); }
});

// POST /api/news/:id/upload-image
router.post('/:id/upload-image', auth([1, 2]), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'ไม่พบไฟล์' });
    if (!IMAGE_EXT.includes(path.extname(req.file.originalname).toLowerCase())) {
      return res.status(400).json({ message: 'อนุญาตเฉพาะไฟล์รูปภาพ (jpg, jpeg, png, gif) เท่านั้น' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    await pool.query('UPDATE news SET image_news=? WHERE id_news=?', [fileUrl, req.params.id]);
    res.json({ message: 'อัปโหลดรูปภาพสำเร็จ', url: fileUrl });
  } catch (err) { next(err); }
});

module.exports = router;
