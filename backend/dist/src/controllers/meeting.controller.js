"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.getRooms = exports.cancelMeeting = exports.bookMeeting = exports.getMeetings = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const scheduler_service_1 = require("../services/scheduler.service");
exports.getMeetings = (0, express_async_handler_1.default)(async (req, res) => {
    const dateStr = req.query.date;
    const roomId = req.query.roomId;
    const date = dateStr ? new Date(dateStr) : undefined;
    const meetings = await scheduler_service_1.schedulerService.getAllMeetings({ date, roomId });
    res.status(200).json({
        success: true,
        data: meetings,
        message: 'Meetings fetched successfully',
    });
});
exports.bookMeeting = (0, express_async_handler_1.default)(async (req, res) => {
    const { title, startTime, endTime } = req.body;
    try {
        const meeting = await scheduler_service_1.schedulerService.bookMeeting(title, new Date(startTime), new Date(endTime));
        res.status(201).json({
            success: true,
            data: meeting,
            message: 'Meeting scheduled successfully',
        });
    }
    catch (error) {
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
exports.cancelMeeting = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    try {
        const meeting = await scheduler_service_1.schedulerService.cancelMeeting(id);
        res.status(200).json({
            success: true,
            data: meeting,
            message: 'Meeting cancelled and room freed successfully',
        });
    }
    catch (error) {
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
exports.getRooms = (0, express_async_handler_1.default)(async (req, res) => {
    const rooms = await scheduler_service_1.schedulerService.getAllRooms();
    res.status(200).json({
        success: true,
        data: rooms,
        message: 'Rooms fetched successfully',
    });
});
exports.getDashboardStats = (0, express_async_handler_1.default)(async (req, res) => {
    const dateStr = req.query.date;
    const date = dateStr ? new Date(dateStr) : new Date();
    const stats = await scheduler_service_1.schedulerService.getDashboardStats(date);
    res.status(200).json({
        success: true,
        data: stats,
        message: 'Dashboard statistics fetched successfully',
    });
});
