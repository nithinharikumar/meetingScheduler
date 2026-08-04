"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = require("./config");
const db_1 = require("./config/db");
const seed_1 = require("./config/seed");
const meeting_routes_1 = __importDefault(require("./routes/meeting.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const app = (0, express_1.default)();
// Middleware configuration
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: '*', // For demo purposes; configure production domains as needed
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)(config_1.config.NODE_ENV === 'production' ? 'combined' : 'dev'));
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
});
// Register API routes
app.use('/api', meeting_routes_1.default);
// Register 404 & Global Error handlers
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
// Server startup
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
        await (0, seed_1.seedRooms)();
        const server = app.listen(config_1.config.PORT, () => {
            console.log(`🚀 Meeting Room Scheduler API listening on port ${config_1.config.PORT} in ${config_1.config.NODE_ENV} mode`);
        });
        const gracefulShutdown = async () => {
            console.log('📡 Initiating graceful shutdown...');
            server.close(async () => {
                console.log('📡 Express server closed.');
                await (0, db_1.disconnectDB)();
                process.exit(0);
            });
        };
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
    }
    catch (error) {
        console.error('❌ Failed to start the server:', error);
        process.exit(1);
    }
};
if (require.main === module) {
    startServer();
}
exports.default = app;
