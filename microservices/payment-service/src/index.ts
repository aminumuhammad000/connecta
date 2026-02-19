import { app } from './app';
import { sequelize } from './config/database';

const start = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to Postgres (Payment Service)');
        await sequelize.sync();
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log('Payment Service listening on port 3000');
    });
};

start();
