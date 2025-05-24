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
exports.Course = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const QuestionSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['multiple-choice', 'fill-blank', 'text', 'audio'],
        required: true,
    },
    question: {
        type: String,
        required: true,
    },
    options: [String],
    correctAnswer: {
        type: String,
        required: true,
    },
    points: {
        type: Number,
        required: true,
        default: 1,
    },
    media: {
        type: {
            type: String,
            enum: ['image', 'audio'],
        },
        url: String,
    },
});
const ChapterSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    questions: [QuestionSchema],
});
const UnitSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    chapters: [ChapterSchema],
});
const SectionSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    units: [UnitSchema],
});
const CourseSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a course title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a course description'],
        maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    instructor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    enrolledStudents: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        }],
    sections: [SectionSchema],
}, {
    timestamps: true,
});
exports.Course = mongoose_1.default.model('Course', CourseSchema);
