import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { schedulerService } from '../services/scheduler.service';

// ────────────────────────────────────────────────────────
// Meeting Controllers
// ────────────────────────────────────────────────────────

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
  const { title, startTime, endTime, roomId } = req.body;

  try {
    const meeting = await schedulerService.bookMeeting(
      title,
      new Date(startTime),
      new Date(endTime),
      roomId
    );

    res.status(201).json({
      success: true,
      data: meeting,
      message: 'Meeting scheduled successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown scheduling error';

    if (message.includes('No rooms are available') || message.includes('occupied')) {
      res.status(409).json({
        success: false,
        error: {
          code: 'ROOMS_OCCUPIED',
          message: message.includes('occupied')
            ? 'The selected meeting room is occupied during the requested timeframe.'
            : 'All meeting rooms are occupied during the requested timeframe.',
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

export const updateMeeting = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, startTime, endTime, roomId } = req.body;

  try {
    const meeting = await schedulerService.updateMeeting(id, {
      title,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      roomId,
    });

    res.status(200).json({
      success: true,
      data: meeting,
      message: 'Meeting updated successfully',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const isConflict = message.includes('occupied');
    res.status(isConflict ? 409 : 400).json({
      success: false,
      error: {
        code: isConflict ? 'ROOMS_OCCUPIED' : 'UPDATE_FAILED',
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

// ────────────────────────────────────────────────────────
// Room Controllers
// ────────────────────────────────────────────────────────

export const getRooms = asyncHandler(async (req: Request, res: Response) => {
  const rooms = await schedulerService.getAllRooms();

  res.status(200).json({
    success: true,
    data: rooms,
    message: 'Rooms fetched successfully',
  });
});

export const createRoom = asyncHandler(async (req: Request, res: Response) => {
  const { name, capacity, description } = req.body;

  try {
    const room = await schedulerService.createRoom(name, Number(capacity) || 10, description);
    res.status(201).json({ success: true, data: room, message: 'Room created successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create room';
    res.status(400).json({ success: false, error: { code: 'CREATE_ROOM_FAILED', message } });
  }
});

export const updateRoom = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, capacity, description } = req.body;

  try {
    const room = await schedulerService.updateRoom(id, {
      name,
      capacity: capacity !== undefined ? Number(capacity) : undefined,
      description,
    });
    res.status(200).json({ success: true, data: room, message: 'Room updated successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update room';
    res.status(400).json({ success: false, error: { code: 'UPDATE_ROOM_FAILED', message } });
  }
});

export const deleteRoom = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await schedulerService.deleteRoom(id);
    res.status(200).json({ success: true, data: null, message: 'Room deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete room';
    const isConflict = message.includes('active confirmed');
    res.status(isConflict ? 409 : 400).json({
      success: false,
      error: { code: isConflict ? 'ROOM_HAS_MEETINGS' : 'DELETE_ROOM_FAILED', message },
    });
  }
});
