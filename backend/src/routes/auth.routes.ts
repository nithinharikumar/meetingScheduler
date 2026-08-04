import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per windowMs
  message: { error: { message: 'Too many requests, please try again later.' } }
});

router.post('/register', authLimiter, requireAuth, requireRole(['SuperAdmin']), register);
router.post('/login', authLimiter, login);
router.get('/me', requireAuth, getMe);

export default router;
