"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCreatedCourses = exports.getEnrolledCourses = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
// Register user
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        // Check if user already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Create user
        const user = await User_1.default.create({
            name,
            email,
            password,
            role: role || 'student'
        });
        // Generate token
        const token = user.getSignedJwtToken();
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
};
exports.register = register;
// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Generate token
        const token = user.getSignedJwtToken();
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
};
exports.login = login;
// Get user profile
const getProfile = async (req, res) => {
    var _a;
    try {
        const user = await User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ message: 'Error getting profile' });
    }
};
exports.getProfile = getProfile;
// Update user profile
const updateProfile = async (req, res) => {
    var _a;
    try {
        const { name, email, profile } = req.body;
        const user = await User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Update fields
        if (name)
            user.name = name;
        if (email)
            user.email = email;
        if (profile)
            user.profile = { ...user.profile, ...profile };
        await user.save();
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile: user.profile
            }
        });
    }
    catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};
exports.updateProfile = updateProfile;
// Get enrolled courses
const getEnrolledCourses = async (req, res) => {
    var _a;
    try {
        const user = await User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)
            .populate({
            path: 'enrolledCourses',
            select: 'title description instructor',
            populate: {
                path: 'instructor',
                select: 'name email'
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.enrolledCourses);
    }
    catch (error) {
        console.error('Error getting enrolled courses:', error);
        res.status(500).json({ message: 'Error getting enrolled courses' });
    }
};
exports.getEnrolledCourses = getEnrolledCourses;
// Get created courses
const getCreatedCourses = async (req, res) => {
    var _a;
    try {
        const user = await User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)
            .populate({
            path: 'createdCourses',
            select: 'title description enrolledStudents'
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.createdCourses);
    }
    catch (error) {
        console.error('Error getting created courses:', error);
        res.status(500).json({ message: 'Error getting created courses' });
    }
};
exports.getCreatedCourses = getCreatedCourses;
