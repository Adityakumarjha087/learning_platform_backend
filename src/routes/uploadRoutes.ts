import express from 'express';
import { upload, handleFileUpload } from '../controllers/uploadController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/upload', authenticateToken, upload.single('file'), handleFileUpload);

export default router;