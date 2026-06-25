const jwt = require('jsonwebtoken');

module.exports = (allowedRights = []) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      if (allowedRights.length && !allowedRights.includes(decoded.right)) {
        return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึง' });
      }
      next();
    } catch {
      res.status(401).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
    }
  };
};
