"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparkTransaction = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class SparkTransaction extends sequelize_1.Model {
}
exports.SparkTransaction = SparkTransaction;
SparkTransaction.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('daily_login', 'job_payment', 'admin_adjustment', 'referral_bonus', 'spending'),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    referenceId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'spark_transactions',
});
// In production, use migrations
SparkTransaction.sync();
