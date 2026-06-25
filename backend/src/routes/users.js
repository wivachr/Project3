const router = require('express').Router();
const crypto = require('crypto');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const md5 = (str) => crypto.createHash('md5').update(str).digest('hex');

router.get('/', auth([1]), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const key = req.query.key || '';
    const offset = (page - 1) * limit;
    const where = key ? 'WHERE (u.username LIKE ? OR u.name_user LIKE ? OR u.sname_user LIKE ?)' : '';
    const params = key ? [`%${key}%`, `%${key}%`, `%${key}%`] : [];

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM user u ${where}`, params);
    const [rows] = await pool.query(
      `SELECT u.id_user, u.username, u.name_user, u.sname_user,
              CONCAT(u.name_user,' ',u.sname_user) AS fullname,
              u.id_right, u.status_user, r.name_right
       FROM user u LEFT JOIN \`right\` r ON u.id_right=r.id_right
       ${where} ORDER BY u.id_user LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    res.json({ data: rows, total, page, limit });
  } catch (err) { next(err); }
});

router.post('/', auth([1]), async (req, res, next) => {
  try {
    const { username, password, name_user, sname_user, id_right } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'กรุณากรอก username และ password' });
    await pool.query(
      "INSERT INTO user (username,password,name_user,sname_user,id_right,status_user) VALUES (?,?,?,?,?,'1')",
      [username, md5(password), name_user || '', sname_user || '', id_right || 2]
    );
    res.status(201).json({ message: 'เพิ่มผู้ใช้สำเร็จ' });
  } catch (err) { next(err); }
});

router.put('/:id', auth([1]), async (req, res, next) => {
  try {
    const { name_user, sname_user, id_right, status_user } = req.body;
    await pool.query(
      'UPDATE user SET name_user=?,sname_user=?,id_right=?,status_user=? WHERE id_user=?',
      [name_user, sname_user, id_right, status_user, req.params.id]
    );
    res.json({ message: 'แก้ไขผู้ใช้สำเร็จ' });
  } catch (err) { next(err); }
});

router.post('/:id/reset-password', auth([1]), async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    await pool.query('UPDATE user SET password=? WHERE id_user=?', [md5(newPassword), req.params.id]);
    res.json({ message: 'รีเซ็ตรหัสผ่านสำเร็จ' });
  } catch (err) { next(err); }
});

router.delete('/:id', auth([1]), async (req, res, next) => {
  try {
    await pool.query('DELETE FROM user WHERE id_user=?', [req.params.id]);
    res.json({ message: 'ลบผู้ใช้สำเร็จ' });
  } catch (err) { next(err); }
});

module.exports = router;
