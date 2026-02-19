
import { app } from './app';
import { rabbitMQWrapper } from './rabbitmq-wrapper';
// import { sequelize } from './config/database'; // We will create this next

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }
    if (!process.env.DB_URI) {
        throw new Error('DB_URI must be defined');
    }
    if (!process.env.RABBITMQ_URL) {
        throw new Error('RABBITMQ_URL must be defined');
    }

    try {
        await rabbitMQWrapper.connect(process.env.RABBITMQ_URL);
        // await sequelize.authenticate();
        console.log('Connected to Postgres');
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log('Auth Service listening on port 3000');
    });
};

start();
