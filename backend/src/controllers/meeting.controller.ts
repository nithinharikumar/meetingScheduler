import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { schedulerService } from '../services/scheduler.service';

export const getMeetings = asyncHandler(async (req: Request, res: Response) => {
  const dateStr = req.query.date as string | undefined;
  const roomId = req.query.roomId as string | undefined;

  const date = dateStr ? new Date(dateStr) : undefined;
  const meetings = await schedulerService.getAllMeetings({ date, roomId });

  res.status(200).json({
    success: true,
    data: meetings,
    message: 'Meetings fetched successfully',
  });
});

export const getMeetingById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const meeting = await schedulerService.getMeetingById(id);

  if (!meeting) {
    res.status(404).json({
      success: false,
      error: {
        code: 'MEETING_NOT_FOUND',
        message: 'The requested meeting could not be found.',
      },
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: meeting,
    message: 'Meeting fetched successfully',
  });
});

export const bookMeeting = asyncHandler(async (req: Request, res: Response) => {
  const { title, startTime, endTime } = req.body;

  try {
    const meeting = await schedulerService.bookMeeting(
      title,
      new Date(startTime),
      new Date(endTime)
    );

    res.status(201).json({
      success: true,
      data: meeting,
      message: 'Meeting scheduled successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown scheduling error';
    
    // Check if the error is due to unavailable rooms
    if (message.includes('No rooms are available')) {
      res.status(409).json({
        success: false,
        error: {
          code: 'ROOMS_OCCUPIED',
          message: 'All meeting rooms are occupied during the requested timeframe.',
        },
      });
      return;
    }

    res.status(400).json({
      success: false,
      error: {
        code: 'SCHEDULING_FAILED',
        message,
      },
    });
  }
});

export const cancelMeeting = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const meeting = await schedulerService.cancelMeeting(id);

    res.status(200).json({
      success: true,
      data: meeting,
      message: 'Meeting cancelled and room freed successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown cancellation error';
    
    res.status(400).json({
      success: false,
      error: {
        code: 'CANCELLATION_FAILED',
        message,
      },
    });
  }
});

export const getRooms = asyncHandler(async (req: Request, res: Response) => {
  const rooms = await schedulerService.getAllRooms();

  res.status(200).json({
    success: true,
    data: rooms,
    message: 'Rooms fetched successfully',
  });
});

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const dateStr = req.query.date as string | undefined;
  const date = dateStr ? new Date(dateStr) : new Date();

  const stats = await schedulerService.getDashboardStats(date);

  res.status(200).json({
    success: true,
    data: stats,
    message: 'Dashboard statistics fetched successfully',
  });
});
