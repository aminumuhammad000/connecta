"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dbName = process.env.DB_NAME || 'connecta_rewards';
const dbUser = process.env.DB_USER || 'connecta_rewards';
const dbPassword = process.env.DB_PASSWORD || 'rewards_password';
const dbHost = process.env.DB_HOST || 'rewards-db';
exports.sequelize = new sequelize_1.Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: 'postgres',
    logging: false,
});
