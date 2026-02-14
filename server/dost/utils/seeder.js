import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Profile from '../models/Profile.model.js';
import { Job } from '../models/Job.model.js';
import CollaboProject from '../models/CollaboProject.model.js';
import ProjectRole from '../models/ProjectRole.model.js';
import CollaboWorkspace from '../models/CollaboWorkspace.model.js';
import Notification from '../models/Notification.model.js';
const freelancersData = [
    {
        _id: '660000000000000000000001',
        email: 'mike.wilson@demo.com',
        password: 'Password123!',
        firstName: 'Mike',
        lastName: 'Wilson',
        userType: 'freelancer',
        phoneNumber: '+2348045678901',
        isVerified: true,
        isPremium: true,
        skills: ['React Native', 'Flutter', 'iOS', 'Android'],
        location: 'Lagos, Nigeria'
    },
    {
        _id: '660000000000000000000002',
        email: 'f@gmail.com',
        password: '123456',
        firstName: 'Frank',
        lastName: 'Freelancer',
        userType: 'freelancer',
        phoneNumber: '+2348000000001',
        isVerified: true,
        isPremium: true,
        skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
        location: 'Lagos, Nigeria'
    },
    { _id: '660000000000000000000101', email: 'a@gmail.com', password: '123456', firstName: 'Alice', lastName: 'Appdev', userType: 'freelancer', skills: ['React', 'Next.js'], isVerified: true },
    { _id: '660000000000000000000102', email: 'b@gmail.com', password: '123456', firstName: 'Bob', lastName: 'Backend', userType: 'freelancer', skills: ['Node.js', 'Express'], isVerified: true },
    { _id: '660000000000000000000103', email: 'd@gmail.com', password: '123456', firstName: 'Dave', lastName: 'DevOps', userType: 'freelancer', skills: ['Docker', 'AWS'], isVerified: true }
];
const clientData = {
    _id: '660000000000000000000003',
    email: 'c@gmail.com',
    password: '123456',
    firstName: 'Charlie',
    lastName: 'Client',
    userType: 'client',
    phoneNumber: '+2348000000002',
    isVerified: true
};
export const seedFreelancersIfMissing = async () => {
    try {
        console.log('🌱 Checking seed data...');
        // 1. Seed Freelancers
        for (const data of freelancersData) {
            const exists = await User.findOne({ email: data.email });
            if (!exists) {
                console.log(`Creating freelancer: ${data.email}`);
                const hashedPassword = await bcrypt.hash(data.password, 10);
                const user = await User.create({
                    _id: data._id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    password: hashedPassword,
                    userType: data.userType,
                    isVerified: data.isVerified,
                    isPremium: data.isPremium
                });
                await Profile.create({
                    user: user._id,
                    phoneNumber: data.phoneNumber,
                    location: data.location,
                    skills: data.skills,
                    bio: `Experienced ${data.skills[0]} developer ready to work.`,
                    jobSuccessScore: 100,
                    averageRating: 5.0,
                    totalReviews: 12
                });
            }
        }
        // 2. Seed Client & Jobs
        let client = await User.findOne({ email: clientData.email });
        if (!client) {
            console.log(`Creating client: ${clientData.email}`);
            const hashedPassword = await bcrypt.hash(clientData.password, 10);
            client = await User.create({
                _id: clientData._id,
                firstName: clientData.firstName,
                lastName: clientData.lastName,
                email: clientData.email,
                password: hashedPassword,
                userType: clientData.userType,
                isVerified: clientData.isVerified
            });
        }
        // 3. Mock Jobs
        const validClientId = client ? client._id : clientData._id;
        const jobCount = await Job.countDocuments({ clientId: validClientId });
        if (jobCount === 0) {
            console.log('Creating 10 Mock Jobs...');
            const jobTitles = [
                'Build a React Native App', 'Node.js Backend Developer Needed', 'UI/UX Redesign for Startup',
                'Full Stack Web App', 'E-commerce Site Migration', 'Flutter Developer for MVP',
                'Python Scripts for Data Analysis', 'WordPress Theme Customization', 'SEO Optimization Expert',
                'DevOps CI/CD Pipeline Setup'
            ];
            for (let i = 0; i < 10; i++) {
                const jobId = `6600000000000000000000${10 + i}`;
                await Job.create({
                    _id: jobId,
                    clientId: validClientId,
                    company: 'Connecta Demo Corp',
                    title: jobTitles[i] || `Mock Job ${i + 1}`,
                    description: `This is a detailed description for mock job ${i + 1}.`,
                    budget: (i + 1) * 10000,
                    skills: ['React', 'Node.js'],
                    status: 'active',
                    locationType: 'remote',
                    location: 'Remote',
                    category: 'Development',
                    experience: 'Intermediate',
                    jobType: 'freelance'
                });
            }
        }
        // 4. Mock Collabo Projects
        const projCount = await CollaboProject.countDocuments({ clientId: validClientId });
        if (projCount === 0) {
            console.log('Creating 5 Collabo Projects...');
            const collaboTitles = [
                'Next-Gen Fintech Platform', 'AI-Powered Health App', 'Blockchain Marketplace',
                'Smart Home IoT System', 'EdTech Learning Portal'
            ];
            for (let i = 0; i < 5; i++) {
                const projId = `6600000000000000000000${50 + i}`;
                await CollaboProject.create({
                    _id: projId,
                    clientId: validClientId,
                    title: collaboTitles[i],
                    description: `Big team project for ${collaboTitles[i]}.`,
                    totalBudget: 500000,
                    status: 'planning',
                    recommendedStack: ['React', 'Node.js']
                });
            }
        }
        // 5. Create Specific Collabo Scenario (Multi-Vendor E-commerce)
        const mvId = '660000000000000000000200';
        const existsMV = await CollaboProject.findOne({ _id: mvId });
        if (!existsMV) {
            console.log('Creating Multi-Vendor Ecommerce Project & Invites...');
            const project = await CollaboProject.create({
                _id: mvId,
                clientId: validClientId,
                title: 'Multi-Vendor Ecommerce Platform',
                description: 'Building a scalable multi-vendor marketplace like Amazon/Etsy.',
                totalBudget: 15000,
                status: 'active',
                recommendedStack: ['Next.js', 'Node.js', 'MongoDB', 'AWS'],
                milestones: [{ title: 'MVP Launch', duration: '2 months', description: 'Core features' }]
            });
            const workspace = await CollaboWorkspace.create({
                projectId: project._id,
                channels: [{ name: 'General', roleIds: [] }]
            });
            project.workspaceId = workspace._id;
            await project.save();
            const inviteList = [
                { email: 'a@gmail.com', role: 'Frontend Dev', budget: 3000, skills: ['React'] },
                { email: 'b@gmail.com', role: 'Backend Dev', budget: 4000, skills: ['Node.js'] },
                { email: 'd@gmail.com', role: 'DevOps Engineer', budget: 4000, skills: ['AWS'] },
                { email: 'f@gmail.com', role: 'UI/UX Designer', budget: 2000, skills: ['Figma'] }
            ];
            for (const invite of inviteList) {
                const user = await User.findOne({ email: invite.email });
                if (user) {
                    const role = await ProjectRole.create({
                        projectId: project._id,
                        title: invite.role,
                        description: `Responsible for ${invite.role}`,
                        budget: invite.budget,
                        skills: invite.skills,
                        status: 'open'
                    });
                    // Check duplicate notification via relatedId
                    const existingNotif = await Notification.findOne({ relatedId: role._id, type: 'collabo_invite' });
                    if (!existingNotif) {
                        await Notification.create({
                            userId: user._id,
                            type: 'collabo_invite',
                            title: `Team Invite: ${invite.role}`,
                            message: `You have been invited to join "Multi-Vendor Ecommerce" as ${invite.role}.`,
                            relatedId: role._id,
                            relatedType: 'project',
                            link: `/collabo/invite/${role._id}`,
                            isRead: false
                        });
                    }
                }
            }
        }
        console.log('✅ Seeding complete with deterministic IDs.');
    }
    catch (error) {
        console.error('❌ Error in seeder:', error);
    }
};
