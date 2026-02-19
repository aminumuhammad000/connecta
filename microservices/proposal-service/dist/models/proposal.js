"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Proposal = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Proposal extends sequelize_1.Model {
}
exports.Proposal = Proposal;
Proposal.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    jobId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    freelancerId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    coverLetter: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    bidAmount: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    duration: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending',
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'proposals',
});
// Sync model with DB (force: false to avoid data loss)
// In production, use migrations
Proposal.sync();
