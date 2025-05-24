"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Progress = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ProgressSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    currentSection: { type: String },
    currentUnit: { type: String },
    currentChapter: { type: String },
    completedChapters: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Chapter'
        }],
    quizScores: [{
            chapterId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Chapter',
                required: true
            },
            score: {
                type: Number,
                required: true
            },
            totalPoints: {
                type: Number,
                required: true
            },
            submittedAt: {
                type: Date,
                default: Date.now
            },
            lastAttempt: {
                type: Date,
                default: Date.now
            }
        }],
    lastAccessedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
// Create compound index for user and course
ProgressSchema.index({ user: 1, course: 1 }, { unique: true });
exports.Progress = mongoose_1.default.model('Progress', ProgressSchema);
