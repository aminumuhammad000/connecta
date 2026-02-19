import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

interface ContractAttributes {
    id?: string;
    projectId: string;
    jobId?: string;
    clientId: string;
    freelancerId: string;
    title: string;
    description: string;
    contractType: 'fixed_price' | 'hourly' | 'milestone';
    totalBudget: number;
    currency: string;
    status: 'draft' | 'pending_signatures' | 'active' | 'completed' | 'terminated' | 'disputed' | 'cancelled';
    startDate: Date;
    endDate: Date;
    milestones?: string; // JSON string
    escrowEnabled: boolean;
    platformFeePercent: number;
    signatureHash?: string;
    signedAt?: Date;
}

export class Contract extends Model<ContractAttributes> implements ContractAttributes {
    public id!: string;
    public projectId!: string;
    public jobId?: string;
    public clientId!: string;
    public freelancerId!: string;
    public title!: string;
    public description!: string;
    public contractType!: 'fixed_price' | 'hourly' | 'milestone';
    public totalBudget!: number;
    public currency!: string;
    public status!: 'draft' | 'pending_signatures' | 'active' | 'completed' | 'terminated' | 'disputed' | 'cancelled';
    public startDate!: Date;
    public endDate!: Date;
    public milestones!: string | null;
    public escrowEnabled!: boolean;
    public platformFeePercent!: number;
    public signatureHash!: string | null;
    public signedAt!: Date | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Contract.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        projectId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        jobId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        clientId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        freelancerId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        contractType: {
            type: DataTypes.ENUM('fixed_price', 'hourly', 'milestone'),
            allowNull: false,
        },
        totalBudget: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING,
            defaultValue: 'NGN',
        },
        status: {
            type: DataTypes.ENUM('draft', 'pending_signatures', 'active', 'completed', 'terminated', 'disputed', 'cancelled'),
            defaultValue: 'draft',
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        milestones: {
            type: DataTypes.TEXT, // JSON string
            allowNull: true,
        },
        escrowEnabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        platformFeePercent: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 10.00,
        },
        signatureHash: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        signedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'contracts',
    }
);
