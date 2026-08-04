"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = require("./index");
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(index_1.config.MONGO_URI);
        console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error instanceof Error ? error.message : error}`);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    try {
        await mongoose_1.default.disconnect();
        console.log('📡 MongoDB Disconnected');
    }
    catch (error) {
        console.error(`❌ MongoDB Disconnection Error: ${error instanceof Error ? error.message : error}`);
    }
};
exports.disconnectDB = disconnectDB;
