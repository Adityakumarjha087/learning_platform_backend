import express from 'express';
import { protect } from '../middleware/auth';
import {
  register,
  login,
  getMe,
  createAdmin,
} from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/create-admin', createAdmin);

router.get('/me', protect, getMe);

export default router;