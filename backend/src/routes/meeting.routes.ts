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

const router = Router();

// ── Room routes ─────────────────────────────────────────
router.get('/rooms', getRooms);
router.post('/rooms', createRoom);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);

// ── Meeting routes ──────────────────────────────────────
router.get('/meetings/stats', getDashboardStats);
router.get('/meetings', validate(getMeetingsQuerySchema), getMeetings);
router.get('/meetings/:id', getMeetingById);
router.post('/meetings', validate(createMeetingSchema), bookMeeting);
router.put('/meetings/:id', updateMeeting);
router.patch('/meetings/:id/cancel', cancelMeeting);

export default router;
