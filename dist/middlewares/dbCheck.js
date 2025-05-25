"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDbConnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const checkDbConnection = (req, res, next) => {
    if (mongoose_1.default.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: 'Database connection is not ready. Please try again in a few moments.',
        });
    }
    next();
};
exports.checkDbConnection = checkDbConnection;
