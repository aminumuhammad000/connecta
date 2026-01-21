
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../src/models/user.model';
import Job from '../src/models/Job.model';
import CollaboProject from '../src/models/CollaboProject.model';
import Profile from '../src/models/Profile.model';
import connectDB from '../src/config/db.config';

dotenv.config();

const SEED_PASSWORD = '123456';

const seedDemoData = async () => {
    try {
        await connectDB();
        console.log('✅ Connected to MongoDB');

        // 1. Create or Get Users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(SEED_PASSWORD, salt);

        // Freelancer
        let freelancer = await User.findOne({ email: 'f@gmail.com' });
        if (!freelancer) {
            freelancer = await User.create({
                firstName: 'Frank',
                lastName: 'Freelancer',
                email: 'f@gmail.com',
                password: hashedPassword,
                userType: 'freelancer',
                isVerified: true
            });
            console.log('✅ Created Freelancer: f@gmail.com');
        } else {
            freelancer.password = hashedPassword;
            await freelancer.save();
            console.log('ℹ️ Updated Freelancer: f@gmail.com');
        }

        // Freelancer Profile
        const existingProfile = await Profile.findOne({ user: freelancer._id });
        if (!existingProfile) {
            await Profile.create({
                user: freelancer._id,
                title: 'Full Stack Developer',
                bio: 'Experienced developer ready for any challenge.',
                skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
                hourlyRate: 50,
                jobSuccessScore: 100,
                location: 'Lagos, Nigeria',
                isPublic: true
            });
            console.log('✅ Created Profile for Freelancer');
        }

        // Client
        let client = await User.findOne({ email: 'c@gmail.com' });
        if (!client) {
            client = await User.create({
                firstName: 'Charlie',
                lastName: 'Client',
                email: 'c@gmail.com',
                password: hashedPassword,
                userType: 'client',
                isVerified: true
            });
            console.log('✅ Created Client: c@gmail.com');
        } else {
            client.password = hashedPassword;
            await client.save();
            console.log('ℹ️ Updated Client: c@gmail.com');
        }

        // 2. Create Mock Jobs (10)
        console.log('⏳ Creating 10 Mock Jobs...');
        const jobTitles = [
            'Build a React Native App', 'Node.js Backend Developer Needed', 'UI/UX Redesign for Startup',
            'Full Stack Web App', 'E-commerce Site Migration', 'Flutter Developer for MVP',
            'Python Scripts for Data Analysis', 'WordPress Theme Customization', 'SEO Optimization Expert',
            'DevOps CI/CD Pipeline Setup'
        ];

        for (let i = 0; i < 10; i++) {
            await Job.create({
                clientId: client._id,
                title: jobTitles[i] || `Mock Job ${i + 1}`,
                company: 'Connecta Demo Corp',
                description: `This is a detailed description for mock job ${i + 1}. We are looking for an expert to help us deliver this project on time and within budget.`,
                budget: (i + 1) * 10000,
                skills: ['React', 'Node.js', 'Typescript'],
                status: 'active',
                projectType: 'one-time',
                location: 'Remote',
                locationType: 'remote',
                category: 'Development',
                experience: 'Intermediate',
                jobType: 'freelance',
                jobScope: 'international'
            });
        }
        console.log('✅ Created 10 Mock Jobs');

        // 3. Create Collabo Projects (5)
        console.log('⏳ Creating 5 Collabo Projects...');
        const collaboTitles = [
            'Next-Gen Fintech Platform', 'AI-Powered Health App', 'Blockchain Marketplace',
            'Smart Home IoT System', 'EdTech Learning Portal'
        ];

        for (let i = 0; i < 5; i++) {
            await CollaboProject.create({
                clientId: client._id,
                title: collaboTitles[i],
                description: `A large scale team project for ${collaboTitles[i]}. Requires a full squad of designers, devs, and PMs.`,
                totalBudget: (i + 1) * 500000,
                status: 'planning',
                projectType: 'one-time',
                scope: 'international',
                recommendedStack: ['React', 'Node.js', 'AWS', 'MongoDB'],
                roles: [], // Roles would be added separately usually, but project existence is key here
                milestones: []
            });
        }
        console.log('✅ Created 5 Collabo Projects');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedDemoData();
