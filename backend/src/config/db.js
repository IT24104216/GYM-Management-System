import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDb() {
  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured. Set it in backend/.env');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI);
  return mongoose.connection;
}
