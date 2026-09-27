import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { success: false, message: 'Too many login attempts, please try again later' }
});

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.get('/me', authenticateToken, getMe);

export default router;