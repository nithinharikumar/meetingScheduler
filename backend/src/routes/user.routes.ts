import { Router } from 'express';
import { getUsers, createUser, updateUserRole, deleteUser } from '../controllers/user.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// All user routes require authentication and Admin role
router.use(requireAuth);
// Admin and SuperAdmin can get users (SuperAdmin bypasses check)
router.route('/').get(requireRole(['Admin']), getUsers);

// Only SuperAdmin can create users
router.route('/').post(requireRole(['SuperAdmin']), createUser);

// Only SuperAdmin can modify users or assign roles
router.route('/:id/role').put(requireRole(['SuperAdmin']), updateUserRole);
router.route('/:id').delete(requireRole(['SuperAdmin']), deleteUser);

export default router;
