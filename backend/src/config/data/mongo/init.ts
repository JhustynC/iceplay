import mongoose from 'mongoose';
import { envs } from '../../plugins/envs/envs.plugin';

export class MongoDatabase {
  static async connect(): Promise<void> {
    try {
      await mongoose.connect(envs.MONGO_URL);
      console.log('✅ MongoDB connected successfully');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log('MongoDB disconnected');
    } catch (error) {
      console.error('MongoDB disconnection error:', error);
      throw error;
    }
  }
}
