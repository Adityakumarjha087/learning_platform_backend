import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'instructor' | 'admin';
  profile?: {
    avatar?: string;
    bio?: string;
    location?: string;
  };
  enrolledCourses: mongoose.Types.ObjectId[];
  createdCourses: mongoose.Types.ObjectId[];
  progress: {
    courseId: mongoose.Types.ObjectId;
    completedChapters: mongoose.Types.ObjectId[];
    quizScores: {
      chapterId: mongoose.Types.ObjectId;
      score: number;
      totalPoints: number;
    }[];
  }[];
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student'
    },
    profile: {
      avatar: String,
      bio: String,
      location: String
    },
    enrolledCourses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course'
    }],
    createdCourses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course'
    }],
    progress: [{
      courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course'
      },
      completedChapters: [{
        type: Schema.Types.ObjectId,
        ref: 'Chapter'
      }],
      quizScores: [{
        chapterId: {
          type: Schema.Types.ObjectId,
          ref: 'Chapter'
        },
        score: Number,
        totalPoints: Number
      }]
    }]
  },
  {
    timestamps: true
  }
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);