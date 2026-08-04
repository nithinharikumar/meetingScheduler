import { Router } from 'express';
import { getMeetings, bookMeeting, cancelMeeting, getRooms, getDashboardStats } from '../controllers/meeting.controller';
import { validate } from '../middlewares/validator.middleware';
import { createMeetingSchema, getMeetingsQuerySchema } from '../validators/meeting.validator';

const router = Router();

// Room routes
router.get('/rooms', getRooms);

// Meeting routes
router.get('/meetings/stats', getDashboardStats);
router.get('/meetings', validate(getMeetingsQuerySchema), getMeetings);
router.post('/meetings', validate(createMeetingSchema), bookMeeting);
router.patch('/meetings/:id/cancel', cancelMeeting);

export default router;
