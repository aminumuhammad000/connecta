
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ProposalAttributes {
    id: string;
    jobId: string;
    freelancerId: string;
    coverLetter: string;
    bidAmount: number;
    duration: string;
    estimatedDurationDays?: number;
    proposalType: 'hourly' | 'fixed';
    currency: 'NGN' | 'USD';
    status: 'submitted' | 'shortlisted' | 'rejected' | 'accepted' | 'withdrawn';
    milestones?: string; // JSON string
    attachments?: string; // JSON string
}

interface ProposalCreationAttributes extends Optional<ProposalAttributes, 'id' | 'status' | 'milestones' | 'attachments'> { }

class Proposal extends Model<ProposalAttributes, ProposalCreationAttributes> implements ProposalAttributes {
    public id!: string;
    public jobId!: string;
    public freelancerId!: string;
    public coverLetter!: string;
    public bidAmount!: number;
    public duration!: string;
    public estimatedDurationDays!: number | null;
    public proposalType!: 'hourly' | 'fixed';
    public currency!: 'NGN' | 'USD';
    public status!: 'submitted' | 'shortlisted' | 'rejected' | 'accepted' | 'withdrawn';
    public milestones!: string | null;
    public attachments!: string | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Proposal.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        jobId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        freelancerId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        coverLetter: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        bidAmount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        duration: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        estimatedDurationDays: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        proposalType: {
            type: DataTypes.ENUM('hourly', 'fixed'),
            allowNull: false,
            defaultValue: 'fixed',
        },
        currency: {
            type: DataTypes.ENUM('NGN', 'USD'),
            allowNull: false,
            defaultValue: 'NGN',
        },
        status: {
            type: DataTypes.ENUM('submitted', 'shortlisted', 'rejected', 'accepted', 'withdrawn'),
            defaultValue: 'submitted',
        },
        milestones: {
            type: DataTypes.TEXT, // Store as JSON string
            allowNull: true,
        },
        attachments: {
            type: DataTypes.TEXT, // Store as JSON string
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'proposals',
    }
);

// Sync model with DB (force: false to avoid data loss)
// In production, use migrations
Proposal.sync();

export { Proposal };
