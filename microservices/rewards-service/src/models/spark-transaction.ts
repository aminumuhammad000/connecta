
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface SparkTransactionAttributes {
    id: string;
    userId: string;
    amount: number; // Positive for credit, negative for debit
    type: 'daily_login' | 'job_payment' | 'admin_adjustment' | 'referral_bonus' | 'spending';
    description: string;
    referenceId?: string; // e.g., jobId, or another transactionId
}

interface SparkTransactionCreationAttributes extends Optional<SparkTransactionAttributes, 'id' | 'referenceId'> { }

class SparkTransaction extends Model<SparkTransactionAttributes, SparkTransactionCreationAttributes> implements SparkTransactionAttributes {
    public id!: string;
    public userId!: string;
    public amount!: number;
    public type!: 'daily_login' | 'job_payment' | 'admin_adjustment' | 'referral_bonus' | 'spending';
    public description!: string;
    public referenceId!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

SparkTransaction.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('daily_login', 'job_payment', 'admin_adjustment', 'referral_bonus', 'spending'),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        referenceId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'spark_transactions',
    }
);

// In production, use migrations
SparkTransaction.sync();

export { SparkTransaction };
