"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdmin = exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// Generate JWT Token
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({
        id: user._id,
        email: user.email,
        role: user.role,
    }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
// Register user
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const normalizedEmail = email.toLowerCase();
        console.log('Registering user:', normalizedEmail);
        // Check if user exists
        const userExists = await User_1.default.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists',
            });
        }
        // Do NOT hash password here; let pre-save hook handle it
        const user = await User_1.default.create({
            name,
            email: normalizedEmail,
            password, // plain password
            role: 'learner', // Default role
        });
        // Generate token
        const token = generateToken(user);
        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            },
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.register = register;
// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();
        console.log('Login attempt:', normalizedEmail);
        // Check if user exists
        const user = await User_1.default.findOne({ email: normalizedEmail }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }
        // Check password
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }
        // Generate token
        const token = generateToken(user);
        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            },
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.login = login;
// Get current user
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized',
            });
        }
        const user = await User_1.default.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getMe = getMe;
// Create admin user
const createAdmin = async (req, res) => {
    try {
        const { name, email, password, adminToken } = req.body;
        const normalizedEmail = email.toLowerCase();
        if (adminToken !== process.env.ADMIN_SIGNUP_AUTH_TOKEN) {
            return res.status(403).json({
                success: false,
                message: 'Invalid admin authentication token',
            });
        }
        // Check if user exists
        const userExists = await User_1.default.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists',
            });
        }
        // Do NOT hash password here; let pre-save hook handle it
        const user = await User_1.default.create({
            name,
            email: normalizedEmail,
            password,
            role: 'admin',
        });
        // Generate token
        const token = generateToken(user);
        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            },
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.createAdmin = createAdmin;
