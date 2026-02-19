import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/connecta_notifications');
        console.log('Connected to MongoDB (Notification Service)');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};
