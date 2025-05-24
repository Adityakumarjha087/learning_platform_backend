"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    var _a;
    try {
        // 1) Get token from header
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            return next(new errorHandler_1.AppError('Please log in to access this resource', 401));
        }
        // 2) Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
        // 3) Check if user still exists
        const user = await User_1.default.findById(decoded.id);
        if (!user) {
            return next(new errorHandler_1.AppError('User no longer exists', 401));
        }
        // 4) Grant access
        req.user = user;
        next();
    }
    catch (error) {
        next(new errorHandler_1.AppError('Invalid token', 401));
    }
};
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errorHandler_1.AppError('Please log in to access this resource', 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errorHandler_1.AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
