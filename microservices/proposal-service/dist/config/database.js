"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
// In a real app, these would come from env vars
const dbName = process.env.DB_NAME || 'connecta_proposals';
const dbUser = process.env.DB_USER || 'connecta_proposals';
const dbPassword = process.env.DB_PASSWORD || 'proposals_password';
const dbHost = process.env.DB_HOST || 'proposal-db';
exports.sequelize = new sequelize_1.Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: 'postgres',
    logging: false,
});
