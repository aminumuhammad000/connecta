import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Project from '../models/Project.model.js';
import User from '../models/user.model.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const seedProjects = async () => {
    try {
        const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/connecta';
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        const clients = await User.find({ userType: 'client' }).limit(2);
        const freelancers = await User.find({ userType: 'freelancer' }).limit(2);
        if (clients.length === 0 || freelancers.length === 0) {
            console.log('Not enough users to create projects');
            process.exit(1);
        }
        const projects = [
            {
                title: 'E-commerce Website Development',
                description: 'Need a full-stack developer to build a modern e-commerce platform using React and Node.js.',
                summary: 'Full-stack e-commerce platform',
                dateRange: {
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
                },
                status: 'ongoing',
                statusLabel: 'Active',
                clientId: clients[0]._id,
                clientName: clients[0].firstName + ' ' + clients[0].lastName,
                clientVerified: true,
                freelancerId: freelancers[0]._id,
                budget: {
                    amount: 500000,
                    currency: 'NGN',
                    type: 'fixed',
                },
                projectType: 'One-time project',
                deliverables: ['Frontend UI', 'Backend API', 'Payment Integration'],
                activity: [{ description: 'Project started' }],
                milestones: [
                    { title: 'UI Design', status: 'completed', dueDate: new Date() },
                    { title: 'API Dev', status: 'in-progress', dueDate: new Date(Date.now() + 10 * 86400000) },
                ],
            },
            {
                title: 'Mobile App UI/UX Design',
                description: 'Looking for an experienced UI/UX designer to create screens for a fitness tracking app.',
                summary: 'Fitness app UI design',
                dateRange: {
                    startDate: new Date(Date.now() - 15 * 86400000),
                    endDate: new Date(),
                },
                status: 'completed',
                statusLabel: 'Completed',
                clientId: clients[1] ? clients[1]._id : clients[0]._id,
                clientName: clients[1] ? clients[1].firstName + ' ' + clients[1].lastName : clients[0].firstName + ' ' + clients[0].lastName,
                clientVerified: true,
                freelancerId: freelancers[1] ? freelancers[1]._id : freelancers[0]._id,
                budget: {
                    amount: 250000,
                    currency: 'NGN',
                    type: 'fixed',
                },
                projectType: 'One-time project',
                deliverables: ['Figma file', 'Prototypes'],
                activity: [{ description: 'Project completed successfully' }],
            }
        ];
        await Project.insertMany(projects);
        console.log('Successfully seeded projects');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding projects:', error);
        process.exit(1);
    }
};
seedProjects();
