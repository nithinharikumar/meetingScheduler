import { z } from 'zod';

export const createMeetingSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: 'Meeting title is required',
      })
      .trim()
      .min(1, 'Meeting title cannot be empty')
      .max(100, 'Meeting title cannot exceed 100 characters'),
    startTime: z
      .string({
        required_error: 'Start time is required',
      })
      .datetime({ message: 'Start time must be a valid ISO datetime string' })
      .refine((val) => new Date(val) > new Date(), {
        message: 'Start time must be in the future',
      }),
    endTime: z
      .string({
        required_error: 'End time is required',
      })
      .datetime({ message: 'End time must be a valid ISO datetime string' }),
  }).refine(
    (data) => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      return end > start;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  ),
});

export const getMeetingsQuerySchema = z.object({
  query: z.object({
    date: z.string().datetime().optional(),
    roomId: z.string().optional(),
  }),
});
