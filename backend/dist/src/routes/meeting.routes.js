"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const meeting_controller_1 = require("../controllers/meeting.controller");
const validator_middleware_1 = require("../middlewares/validator.middleware");
const meeting_validator_1 = require("../validators/meeting.validator");
const router = (0, express_1.Router)();
// Room routes
router.get('/rooms', meeting_controller_1.getRooms);
// Meeting routes
router.get('/meetings/stats', meeting_controller_1.getDashboardStats);
router.get('/meetings', (0, validator_middleware_1.validate)(meeting_validator_1.getMeetingsQuerySchema), meeting_controller_1.getMeetings);
router.post('/meetings', (0, validator_middleware_1.validate)(meeting_validator_1.createMeetingSchema), meeting_controller_1.bookMeeting);
router.patch('/meetings/:id/cancel', meeting_controller_1.cancelMeeting);
exports.default = router;
