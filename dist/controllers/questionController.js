"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuestion = exports.deleteQuestion = exports.updateQuestion = exports.addQuestion = void 0;
const Course_1 = require("../models/Course");
const addQuestion = async (req, res) => {
    try {
        const { courseId, sectionId, unitId, chapterId } = req.params;
        const { type, question, options, correctAnswer, points, media } = req.body;
        const course = await Course_1.Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const section = course.sections.find((section) => section._id.toString() === sectionId);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }
        const unit = section.units.find((unit) => unit._id.toString() === unitId);
        if (!unit) {
            return res.status(404).json({ message: 'Unit not found' });
        }
        const chapter = unit.chapters.find((chapter) => chapter._id.toString() === chapterId);
        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found' });
        }
        chapter.questions.push({
            type,
            question,
            options,
            correctAnswer,
            points,
            media
        });
        await course.save();
        const newQuestion = chapter.questions[chapter.questions.length - 1];
        res.status(201).json(newQuestion);
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding question', error });
    }
};
exports.addQuestion = addQuestion;
const updateQuestion = async (req, res) => {
    try {
        const { courseId, sectionId, unitId, chapterId, questionId } = req.params;
        const { type, question, options, correctAnswer, points, media } = req.body;
        const course = await Course_1.Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const section = course.sections.find((section) => section._id.toString() === sectionId);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }
        const unit = section.units.find((unit) => unit._id.toString() === unitId);
        if (!unit) {
            return res.status(404).json({ message: 'Unit not found' });
        }
        const chapter = unit.chapters.find((chapter) => chapter._id.toString() === chapterId);
        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found' });
        }
        const questionDoc = chapter.questions.find((question) => question._id.toString() === questionId);
        if (!questionDoc) {
            return res.status(404).json({ message: 'Question not found' });
        }
        if (type)
            questionDoc.type = type;
        if (question)
            questionDoc.question = question;
        if (options)
            questionDoc.options = options;
        if (correctAnswer)
            questionDoc.correctAnswer = correctAnswer;
        if (points)
            questionDoc.points = points;
        if (media)
            questionDoc.media = media;
        await course.save();
        res.json(questionDoc);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating question', error });
    }
};
exports.updateQuestion = updateQuestion;
const deleteQuestion = async (req, res) => {
    try {
        const { courseId, sectionId, unitId, chapterId, questionId } = req.params;
        const course = await Course_1.Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const section = course.sections.find((section) => section._id.toString() === sectionId);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }
        const unit = section.units.find((unit) => unit._id.toString() === unitId);
        if (!unit) {
            return res.status(404).json({ message: 'Unit not found' });
        }
        const chapter = unit.chapters.find((chapter) => chapter._id.toString() === chapterId);
        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found' });
        }
        const questionIndex = chapter.questions.findIndex((question) => question._id.toString() === questionId);
        if (questionIndex === -1) {
            return res.status(404).json({ message: 'Question not found' });
        }
        chapter.questions.splice(questionIndex, 1);
        await course.save();
        res.json({ message: 'Question deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting question', error });
    }
};
exports.deleteQuestion = deleteQuestion;
const getQuestion = async (req, res) => {
    try {
        const { courseId, sectionId, unitId, chapterId, questionId } = req.params;
        const course = await Course_1.Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const section = course.sections.find((section) => section._id.toString() === sectionId);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }
        const unit = section.units.find((unit) => unit._id.toString() === unitId);
        if (!unit) {
            return res.status(404).json({ message: 'Unit not found' });
        }
        const chapter = unit.chapters.find((chapter) => chapter._id.toString() === chapterId);
        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found' });
        }
        const question = chapter.questions.find((question) => question._id.toString() === questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.json(question);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching question', error });
    }
};
exports.getQuestion = getQuestion;
