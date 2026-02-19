"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dbName = process.env.DB_NAME || 'connecta_auth';
const dbUser = process.env.DB_USER || 'connecta_auth';
const dbPassword = process.env.DB_PASSWORD || 'auth_password';
const dbHost = process.env.DB_HOST || 'localhost';
exports.sequelize = new sequelize_1.Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: 'postgres',
    logging: false,
});
