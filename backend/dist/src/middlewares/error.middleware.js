"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const config_1 = require("../config");
const errorHandler = (err, req, res, next) => {
    console.error('💥 Unhandled Error:', err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_SERVER_ERROR',
            message,
            ...(config_1.config.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Resource not found: ${req.method} ${req.originalUrl}`,
        },
    });
};
exports.notFoundHandler = notFoundHandler;
