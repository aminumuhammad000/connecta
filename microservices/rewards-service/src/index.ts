
import { app } from './app';
import { sequelize } from './config/database';
import { rabbitMQWrapper } from './rabbitmq-wrapper';

const start = async () => {
    if (!process.env.RABBITMQ_URL) {
        throw new Error('RABBITMQ_URL must be defined');
    }

    try {
        await rabbitMQWrapper.connect(process.env.RABBITMQ_URL);

        await sequelize.authenticate();
        console.log('Connected to Postgres (Rewards Service)');

        await sequelize.sync();

    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log('Rewards Service listening on port 3000');
    });
};

start();
