import mongoose from 'mongoose';

interface CustomConnectOptions extends mongoose.ConnectOptions {
  dns?: {
    lookup: (hostname: string, options: { timeout: number }, callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void) => void;
  };
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || '', {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 60000,
      retryWrites: true,
      retryReads: true,
      dns: {
        lookup: (hostname: string, options: { timeout: number }, callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void) => {
          const dns = require('dns');
          dns.lookup(hostname, { timeout: 10000 }, callback);
        }
      }
    } as CustomConnectOptions);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    setTimeout(connectDB, 5000);
  }
};

export default connectDB; 