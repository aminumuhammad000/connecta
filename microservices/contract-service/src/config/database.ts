import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(
    process.env.DB_NAME || 'connecta_contracts',
    process.env.DB_USER || 'connecta_contracts',
    process.env.DB_PASSWORD || 'contracts_password',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: false,
    }
);
