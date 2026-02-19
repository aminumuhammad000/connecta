import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(
    process.env.DB_NAME || 'connecta_payments',
    process.env.DB_USER || 'connecta_payments',
    process.env.DB_PASSWORD || 'payments_password',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: false,
    }
);
