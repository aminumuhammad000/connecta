import { app } from './app';
import { sequelize } from './config/database';

const start = async () => {
    if (!process.env.DB_HOST) {
        console.log('DB_HOST not defined, using default');
    }

    try {
        await sequelize.authenticate();
        console.log('Connected to Postgres (Contract Service)');
        await sequelize.sync();
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log('Contract Service listening on port 3000');
    });
};

start();
