import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }
  const secret = process.env.JWT_SECRET || 'fallback_secret_key';
  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(401).json({ success: false, message: `Invalid token: ${err.message}` });
    }
    req.user = user;
    next();
  });
};