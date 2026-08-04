"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMeetingsQuerySchema = exports.createMeetingSchema = void 0;
const zod_1 = require("zod");
exports.createMeetingSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z
            .string({
            required_error: 'Meeting title is required',
        })
            .trim()
            .min(1, 'Meeting title cannot be empty')
            .max(100, 'Meeting title cannot exceed 100 characters'),
        startTime: zod_1.z
            .string({
            required_error: 'Start time is required',
        })
            .datetime({ message: 'Start time must be a valid ISO datetime string' })
            .refine((val) => new Date(val) > new Date(), {
            message: 'Start time must be in the future',
        }),
        endTime: zod_1.z
            .string({
            required_error: 'End time is required',
        })
            .datetime({ message: 'End time must be a valid ISO datetime string' }),
    }).refine((data) => {
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);
        return end > start;
    }, {
        message: 'End time must be after start time',
        path: ['endTime'],
    }),
});
exports.getMeetingsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        date: zod_1.z.string().datetime().optional(),
        roomId: zod_1.z.string().optional(),
    }),
});
