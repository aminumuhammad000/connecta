import { app } from './app';
import { connectDB } from './config/database';

const start = async () => {
    await connectDB();

    app.listen(3000, () => {
        console.log('Chat Service listening on port 3000');
    });
};

start();
