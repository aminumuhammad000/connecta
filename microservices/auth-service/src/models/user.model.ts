
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

// Define User Attributes Interface
interface UserAttributes {
    id?: string;
    email: string;
    passwordHash: string;
    role: 'freelancer' | 'client' | 'admin';
    isVerified: boolean;
    refreshToken?: string | null;
    lastLoginAt?: Date | null;
    lastIpAddress?: string | null;
}

export class User extends Model<UserAttributes> implements UserAttributes {
    public id!: string;
    public email!: string;
    public passwordHash!: string;
    public role!: 'freelancer' | 'client' | 'admin';
    public isVerified!: boolean;
    public refreshToken!: string | null;
    public lastLoginAt!: Date | null;
    public lastIpAddress!: string | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('freelancer', 'client', 'admin'),
            defaultValue: 'freelancer',
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        refreshToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        lastLoginAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        lastIpAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'users',
    }
);
