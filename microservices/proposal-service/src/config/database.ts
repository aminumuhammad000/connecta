
import { Sequelize } from 'sequelize';

// In a real app, these would come from env vars
const dbName = process.env.DB_NAME || 'connecta_proposals';
const dbUser = process.env.DB_USER || 'connecta_proposals';
const dbPassword = process.env.DB_PASSWORD || 'proposals_password';
const dbHost = process.env.DB_HOST || 'proposal-db';

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: 'postgres',
    logging: false,
});
