import express from 'express';
import {
  register,
  login,
  logout,
  refresh,
  verifyEmail,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/verify/:token', verifyEmail);

export default router;
