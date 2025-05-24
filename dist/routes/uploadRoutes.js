"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uploadController_1 = require("../controllers/uploadController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Route for uploading files (audio/images)
router.post('/upload', auth_1.authenticateToken, uploadController_1.upload.single('file'), uploadController_1.handleFileUpload);
exports.default = router;
