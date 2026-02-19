
import { app } from './app';
// import { sequelize } from './config/database'; // Using models directly syncs them, but we should init DB first
import { sequelize } from './config/database';
import { rabbitMQWrapper } from './rabbitmq-wrapper';

const start = async () => {
    /*
  if (!process.env.DB_HOST) {
    throw new Error('DB_HOST must be defined');
  }
  */
    if (!process.env.RABBITMQ_URL) {
        throw new Error('RABBITMQ_URL must be defined');
    }

    try {
        await rabbitMQWrapper.connect(process.env.RABBITMQ_URL);

        await sequelize.authenticate();
        console.log('Connected to Postgres (Proposal Service)');

        // Sync models
        // await sequelize.sync(); 
        // In actual implementation, we might call this or let the model file do it. 
        // The model file we wrote calls .sync() at the end, so it might be redundant or safe to call here.

    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log('Proposal Service listening on port 3000');
    });
};

start();
