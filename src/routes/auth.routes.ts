import { Router } from 'express';
import { registerUser, login, getUsers, updateUserStatus } from '../controllers/auth.controller';
import { authenticate, requireRole } from '../middlewares/auth';

const router = Router();

// Public Routes
router.post('/users', registerUser);
router.post('/auth/login', login);

// Protected Admin Routes
router.get('/users', authenticate, requireRole(['ADMIN']), getUsers);

// 2. Add this new route
router.put('/users/:id/status', authenticate, requireRole(['ADMIN']), updateUserStatus);

export default router;