import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/blog');
    console.log('Database connected successfully: 127.0.0.1');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1); // Exit the process with failure
  }
};

export default connectDB;
