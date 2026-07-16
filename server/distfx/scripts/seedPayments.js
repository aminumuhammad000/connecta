import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Payment from '../models/Payment.model.js';
import Wallet from '../models/Wallet.model.js';
import Withdrawal from '../models/Withdrawal.model.js';
import User from '../models/user.model.js';
import Project from '../models/Project.model.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const seedPayments = async () => {
    try {
        const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/connecta';
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        const clients = await User.find({ userType: 'client' }).limit(2);
        const freelancers = await User.find({ userType: 'freelancer' }).limit(2);
        const projects = await Project.find().limit(2);
        if (clients.length === 0 || freelancers.length === 0 || projects.length === 0) {
            console.log('Not enough users or projects to create payments');
            process.exit(1);
        }
        const client = clients[0];
        const freelancer = freelancers[0];
        const project = projects[0];
        await Payment.deleteMany({});
        await Wallet.deleteMany({});
        await Withdrawal.deleteMany({});
        // Seed Wallets
        const wallets = [
            {
                userId: client._id,
                balance: 1000000,
                escrowBalance: 250000,
                availableBalance: 750000,
                totalSpent: 500000,
                totalEarnings: 0,
                isActive: true,
            },
            {
                userId: freelancer._id,
                balance: 300000,
                escrowBalance: 50000,
                availableBalance: 250000,
                totalSpent: 0,
                totalEarnings: 800000,
                isActive: true,
            }
        ];
        await Wallet.insertMany(wallets);
        // Seed Payments
        const payments = [
            {
                transactionId: 'TXN-' + Date.now(),
                payerId: client._id,
                payeeId: freelancer._id,
                projectId: project._id,
                amount: 250000,
                platformFee: 25000,
                netAmount: 225000,
                status: 'completed',
                paymentMethod: 'paystack',
                paymentType: 'project_payment',
                escrowStatus: 'released',
                description: 'Payment for E-commerce Website',
                gatewayReference: 'PAYSTACK-' + Date.now(),
                paidAt: new Date(),
                releasedAt: new Date(),
            },
            {
                transactionId: 'TXN-' + (Date.now() + 100),
                payerId: clients[1] ? clients[1]._id : client._id,
                payeeId: freelancers[1] ? freelancers[1]._id : freelancer._id,
                projectId: projects[1] ? projects[1]._id : project._id,
                amount: 50000,
                platformFee: 5000,
                netAmount: 45000,
                status: 'pending',
                paymentMethod: 'wallet',
                paymentType: 'project_payment',
                escrowStatus: 'held',
                description: 'Escrow for Logo Design',
                gatewayReference: 'WALLET-' + Date.now(),
                paidAt: new Date(),
            }
        ];
        await Payment.insertMany(payments);
        // Seed Withdrawals
        const withdrawals = [
            {
                userId: freelancer._id,
                amount: 100000,
                netAmount: 95000,
                status: 'pending',
                bankDetails: {
                    bankName: 'GTBank',
                    bankCode: '058',
                    accountNumber: '0123456789',
                    accountName: freelancer.firstName + ' ' + freelancer.lastName,
                },
                reference: 'WTH-' + Date.now(),
            },
            {
                userId: freelancers[1] ? freelancers[1]._id : freelancer._id,
                amount: 50000,
                netAmount: 48000,
                status: 'completed',
                bankDetails: {
                    bankName: 'Zenith Bank',
                    bankCode: '057',
                    accountNumber: '9876543210',
                    accountName: (freelancers[1] || freelancer).firstName,
                },
                reference: 'WTH-' + (Date.now() + 100),
                processedAt: new Date(),
            }
        ];
        await Withdrawal.insertMany(withdrawals);
        console.log('Successfully seeded payments, wallets, and withdrawals');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding payments:', error);
        process.exit(1);
    }
};
seedPayments();
