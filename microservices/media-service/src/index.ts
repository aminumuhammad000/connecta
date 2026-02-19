import { app } from './app';
import mongoose from 'mongoose';

const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/connecta_media');
        console.log('Connected to MongoDB (Media Service)');
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log('Media Service listening on port 3000');
    });
};

start();
