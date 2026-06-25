const router = require('express').Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

const md5 = (str) => crypto.createHash('md5').update(str).digest('hex');

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'กรุณากรอก username และ password' });

    const [rows] = await pool.query(
      `SELECT u.*, r.name_right,
              CONCAT(COALESCE(u.name_user,''),' ',COALESCE(u.sname_user,'')) AS fullname
       FROM user u LEFT JOIN \`right\` r ON u.id_right=r.id_right
       WHERE u.username=? AND u.password=? AND u.status_user='1'`,
      [username, md5(password)]
    );

    if (!rows.length) return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });

    const user = rows[0];
    const fullname = user.fullname?.trim() || user.username;
    const token = jwt.sign(
      { iduser: user.id_user, username: user.username, fullname, right: user.id_right, idproject: user.id_project || null },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ token, user: { id: user.id_user, username: user.username, fullname, right: user.id_right, idproject: user.id_project || null } });
  } catch (err) { next(err); }
});

// GET /api/auth/me
router.get('/me', authMiddleware(), (req, res) => {
  res.json(req.user);
});

// POST /api/auth/change-password
router.post('/change-password', authMiddleware(), async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const [rows] = await pool.query(
      'SELECT id_user FROM user WHERE id_user=? AND password=?',
      [req.user.iduser, md5(oldPassword)]
    );
    if (!rows.length) return res.status(400).json({ message: 'รหัสผ่านเดิมไม่ถูกต้อง' });

    await pool.query('UPDATE user SET password=? WHERE id_user=?', [md5(newPassword), req.user.iduser]);
    res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
  } catch (err) { next(err); }
});

module.exports = router;
