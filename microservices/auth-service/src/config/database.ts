import { Sequelize } from 'sequelize';

const dbName = process.env.DB_NAME || 'connecta_auth';
const dbUser = process.env.DB_USER || 'connecta_auth';
const dbPassword = process.env.DB_PASSWORD || 'auth_password';
const dbHost = process.env.DB_HOST || 'localhost';

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: 'postgres',
    logging: false,
});
