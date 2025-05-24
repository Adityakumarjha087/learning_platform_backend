import express from 'express';
import { upload, handleFileUpload } from '../controllers/uploadController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Route for uploading files (audio/images)
router.post('/upload', authenticateToken, upload.single('file'), handleFileUpload);

export default router; 