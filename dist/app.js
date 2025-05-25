"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
const sectionRoutes_1 = __importDefault(require("./routes/sectionRoutes"));
const unitRoutes_1 = __importDefault(require("./routes/unitRoutes"));
const chapterRoutes_1 = __importDefault(require("./routes/chapterRoutes"));
const questionRoutes_1 = __importDefault(require("./routes/questionRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const progressRoutes_1 = __importDefault(require("./routes/progressRoutes"));
const errorHandler_1 = require("./middlewares/errorHandler");
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Serve static files from the uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Dummy GET route at base URL for health check
app.get('/', (req, res) => {
    res.send('i am live and wokring');
});
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/courses', courseRoutes_1.default);
app.use('/api/sections', sectionRoutes_1.default);
app.use('/api/units', unitRoutes_1.default);
app.use('/api/chapters', chapterRoutes_1.default);
app.use('/api/questions', questionRoutes_1.default);
app.use('/api/upload', uploadRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/progress', progressRoutes_1.default);
// Error handling
app.use(errorHandler_1.errorHandler);
// Connect to MongoDB
mongoose_1.default
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-platform')
    .then(() => {
    console.log('Connected to MongoDB');
})
    .catch((error) => {
    console.error('MongoDB connection error:', error);
});
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
