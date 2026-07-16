import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Contract from '../models/Contract.model.js';
import Review from '../models/Review.model.js';
import Notification from '../models/Notification.model.js';
import Verification from '../models/Verification.model.js';
import AuditLog from '../models/AuditLog.model.js';
import { Contact } from '../models/Contact.model.js';
import User from '../models/user.model.js';
import Job from '../models/Job.model.js';
import Project from '../models/Project.model.js';
import Proposal from '../models/Proposal.model.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const seedAllAdmin = async () => {
    try {
        const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/connecta';
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        // Fetch existing users, jobs, projects
        const admins = await User.find({ role: 'admin' }).limit(1);
        const clients = await User.find({ userType: 'client' }).limit(2);
        const freelancers = await User.find({ userType: 'freelancer' }).limit(2);
        const jobs = await Job.find().limit(2);
        const projects = await Project.find().limit(2);
        const proposals = await Proposal.find().limit(2);
        if (clients.length === 0 || freelancers.length === 0) {
            console.log('Not enough users found. Run user seed script first.');
            process.exit(1);
        }
        const admin = admins[0] || clients[0];
        const client = clients[0];
        const freelancer = freelancers[0];
        const job = jobs[0] || { _id: new mongoose.Types.ObjectId() };
        const project = projects[0] || { _id: new mongoose.Types.ObjectId() };
        const proposal = proposals[0] || { _id: new mongoose.Types.ObjectId() };
        // 1. Clear collections
        await Contract.deleteMany({});
        await Review.deleteMany({});
        await Notification.deleteMany({});
        await Verification.deleteMany({});
        await AuditLog.deleteMany({});
        await Contact.deleteMany({});
        console.log('Cleared target collections');
        // 2. Seed Contracts
        const contracts = [
            {
                jobId: job._id,
                projectId: project._id,
                clientId: client._id,
                freelancerId: freelancer._id,
                proposalId: proposal._id,
                title: 'E-commerce Website Development Contract',
                description: 'Standard contract for the development of a fully functional e-commerce website.',
                totalPrice: 500000,
                deliveryTime: 30,
                status: 'active',
                paymentStatus: 'escrow',
            },
            {
                jobId: jobs[1] ? jobs[1]._id : new mongoose.Types.ObjectId(),
                projectId: projects[1] ? projects[1]._id : new mongoose.Types.ObjectId(),
                clientId: clients[1] ? clients[1]._id : client._id,
                freelancerId: freelancers[1] ? freelancers[1]._id : freelancer._id,
                proposalId: proposals[1] ? proposals[1]._id : new mongoose.Types.ObjectId(),
                title: 'Logo Design Agreement',
                description: 'Creation of 3 logo concepts and final delivery of vector files.',
                totalPrice: 50000,
                deliveryTime: 7,
                status: 'completed',
                paymentStatus: 'released',
            }
        ];
        await Contract.insertMany(contracts);
        console.log('Seeded Contracts');
        // 3. Seed Reviews
        const reviews = [
            {
                projectId: project._id,
                reviewerId: client._id,
                revieweeId: freelancer._id,
                reviewerType: 'client',
                rating: 5,
                comment: 'Excellent work! Delivered on time and exceeded my expectations.',
                tags: ['Professional', 'On Time', 'Great Communication'],
                isPublic: true,
            },
            {
                projectId: projects[1] ? projects[1]._id : new mongoose.Types.ObjectId(),
                reviewerId: freelancer._id,
                revieweeId: client._id,
                reviewerType: 'freelancer',
                rating: 4,
                comment: 'Good client, clear requirements, prompt payment. Will work with again.',
                tags: ['Clear Brief', 'Prompt Payment'],
                isPublic: true,
            }
        ];
        await Review.insertMany(reviews);
        console.log('Seeded Reviews');
        // 4. Seed Notifications
        const notifications = [
            {
                userId: admin._id,
                type: 'system',
                title: 'System Update',
                message: 'The Connecta platform has been updated to version 2.0.',
                isRead: false,
            },
            {
                userId: admin._id,
                type: 'info',
                title: 'New Verification Request',
                message: 'User ' + freelancer.firstName + ' has submitted a verification request.',
                relatedId: freelancer._id,
                relatedType: 'user',
                isRead: false,
            },
            {
                userId: freelancer._id,
                type: 'job_invite',
                title: 'Job Invitation',
                message: 'You have been invited to apply for a new job.',
                isRead: true,
            }
        ];
        await Notification.insertMany(notifications);
        console.log('Seeded Notifications');
        // 5. Seed Verifications
        const verifications = [
            {
                user: freelancer._id,
                idType: 'national_id',
                idNumber: 'NIN-123456789',
                fullName: freelancer.firstName + ' ' + freelancer.lastName,
                idFrontImage: 'https://via.placeholder.com/800x500?text=ID+Front',
                idBackImage: 'https://via.placeholder.com/800x500?text=ID+Back',
                selfieImage: 'https://via.placeholder.com/500x500?text=Selfie',
                status: 'pending',
            },
            {
                user: client._id,
                idType: 'passport',
                idNumber: 'A00123456',
                fullName: client.firstName + ' ' + client.lastName,
                idFrontImage: 'https://via.placeholder.com/800x500?text=Passport',
                selfieImage: 'https://via.placeholder.com/500x500?text=Selfie',
                status: 'approved',
                adminNotes: 'Looks good.',
            }
        ];
        await Verification.insertMany(verifications);
        console.log('Seeded Verifications');
        // 6. Seed Audit Logs
        const auditLogs = [
            {
                adminId: admin._id,
                adminName: admin.firstName + ' ' + admin.lastName,
                action: 'APPROVE',
                entityType: 'Verification',
                entityId: client._id.toString(),
                entityName: 'Verification for ' + client.firstName,
                details: { status: 'approved' },
                timestamp: new Date(),
            },
            {
                adminId: admin._id,
                adminName: admin.firstName + ' ' + admin.lastName,
                action: 'BAN',
                entityType: 'User',
                entityId: 'dummy-id',
                entityName: 'Spammer User',
                details: { reason: 'Spamming' },
                timestamp: new Date(Date.now() - 86400000), // 1 day ago
            }
        ];
        await AuditLog.insertMany(auditLogs);
        console.log('Seeded Audit Logs');
        // 7. Seed Contact Messages (Support)
        const contacts = [
            {
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
                subject: 'Cannot upload portfolio items',
                message: 'Hi, I am getting an error when trying to upload images to my portfolio. Please help.',
                status: 'new',
            },
            {
                name: 'John Smith',
                email: 'john@example.com',
                subject: 'Payment not reflecting',
                message: 'My recent withdrawal has not hit my bank account yet. It has been 48 hours.',
                status: 'read',
            }
        ];
        await Contact.insertMany(contacts);
        console.log('Seeded Support/Contact Messages');
        console.log('All admin collections seeded successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding admin collections:', error);
        process.exit(1);
    }
};
seedAllAdmin();
