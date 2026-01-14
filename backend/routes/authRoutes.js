import express from 'express';
import { register, login, getMe, updateProfile, logout } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout); // Add logout route
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;


