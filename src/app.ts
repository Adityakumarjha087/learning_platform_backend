import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import sectionRoutes from './routes/sectionRoutes';
import unitRoutes from './routes/unitRoutes';
import chapterRoutes from './routes/chapterRoutes';
import questionRoutes from './routes/questionRoutes';
import uploadRoutes from './routes/uploadRoutes';
import userRoutes from './routes/userRoutes';
import progressRoutes from './routes/progressRoutes';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'https://learning-platform-frontend-gray.vercel.app/',
  credentials: true,
}));


app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.send('i am live and wokring');
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);

app.use(errorHandler);

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-platform')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;