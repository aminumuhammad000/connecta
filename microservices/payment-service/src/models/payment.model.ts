import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

interface PaymentAttributes {
    id?: string;
    userId: string;
    contractId?: string;
    amount: number;
    currency: string;
    status: 'pending' | 'escrowed' | 'completed' | 'failed' | 'refunded';
    paymentMethod: string;
    transactionId: string;
    idempotencyKey?: string;
    callbackUrl?: string;
    metadata?: string; // JSON string
    reference?: string;
    externalReference?: string;
}

export class Payment extends Model<PaymentAttributes> implements PaymentAttributes {
    public id!: string;
    public userId!: string;
    public contractId?: string;
    public amount!: number;
    public currency!: string;
    public status!: 'pending' | 'escrowed' | 'completed' | 'failed' | 'refunded';
    public paymentMethod!: string;
    public transactionId!: string;
    public idempotencyKey!: string | null;
    public callbackUrl!: string | null;
    public metadata!: string | null;
    public reference!: string | null;
    public externalReference!: string | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Payment.init(
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
        contractId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING,
            defaultValue: 'NGN',
        },
        status: {
            type: DataTypes.ENUM('pending', 'escrowed', 'completed', 'failed', 'refunded'),
            defaultValue: 'pending',
        },
        paymentMethod: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        transactionId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        idempotencyKey: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        callbackUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        metadata: {
            type: DataTypes.TEXT, // JSON string
            allowNull: true,
        },
        reference: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        externalReference: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'payments',
    }
);
