
import mongoose from 'mongoose';
import { app } from './app';
import { rabbitMQWrapper } from './rabbitmq-wrapper';

const start = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }
    if (!process.env.RABBITMQ_URL) {
        throw new Error('RABBITMQ_URL must be defined');
    }

    try {
        await rabbitMQWrapper.connect(process.env.RABBITMQ_URL);

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log('Job Service listening on port 3000');
    });
};

start();
