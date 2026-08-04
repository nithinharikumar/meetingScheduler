import { Router } from 'express';
import {
  getMeetings,
  getMeetingById,
  bookMeeting,
  updateMeeting,
  cancelMeeting,
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getDashboardStats,
} from '../controllers/meeting.controller';
import { validate } from '../middlewares/validator.middleware';
import { createMeetingSchema, getMeetingsQuerySchema } from '../validators/meeting.validator';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// ── Room routes ─────────────────────────────────────────
router.get('/rooms', requireAuth, getRooms);
router.post('/rooms', requireAuth, requireRole(['Admin']), createRoom);
router.put('/rooms/:id', requireAuth, requireRole(['Admin']), updateRoom);
router.delete('/rooms/:id', requireAuth, requireRole(['Admin']), deleteRoom);

// ── Meeting routes ──────────────────────────────────────
router.get('/meetings/stats', requireAuth, getDashboardStats);
router.get('/meetings', requireAuth, validate(getMeetingsQuerySchema), getMeetings);
router.get('/meetings/:id', requireAuth, getMeetingById);
router.post('/meetings', requireAuth, validate(createMeetingSchema), bookMeeting);
router.put('/meetings/:id', requireAuth, updateMeeting);
router.patch('/meetings/:id/cancel', requireAuth, cancelMeeting);

export default router;
