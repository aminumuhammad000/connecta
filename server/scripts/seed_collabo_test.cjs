
const mongoose = require('mongoose');
const User = require('../dist/models/user.model').default;
const Profile = require('../dist/models/Profile.model').default;
const CollaboProject = require('../dist/models/CollaboProject.model').default;
const ProjectRole = require('../dist/models/ProjectRole.model').default;
const CollaboWorkspace = require('../dist/models/CollaboWorkspace.model').default;
const NotificationModel = require('../dist/models/Notification.model').default;
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI && process.env.MONGO_URI.startsWith('mongodb')
    ? process.env.MONGO_URI
    : 'mongodb://127.0.0.1:27017/connecta_db';

const connectDB = async () => {
    try {
        console.log('🔌 Connecting to MongoDB at:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const freelancers = [
    { email: 'a@gmail.com', name: 'Alice', id: '660000000000000000000101', role: 'Frontend Dev', skills: ['React', 'Next.js'] },
    { email: 'b@gmail.com', name: 'Bob', id: '660000000000000000000102', role: 'Backend Dev', skills: ['Node.js', 'Express'] },
    { email: 'd@gmail.com', name: 'Dave', id: '660000000000000000000103', role: 'DevOps Engineer', skills: ['Docker', 'AWS'] },
    { email: 'f@gmail.com', name: 'Frank', id: '660000000000000000000002', role: 'UI/UX Designer', skills: ['Figma', 'Adobe XD'] } // Existing
];

const client = { email: 'c@gmail.com', id: '660000000000000000000003' };

const seedCollaboTest = async () => {
    await connectDB();

    console.log('🌱 Seeding Collabo Test Data...');

    // 1. Ensure Client Exists
    let clientUser = await User.findById(client.id);
    if (!clientUser) {
        console.log('Creating client...');
        clientUser = await User.create({
            _id: client.id,
            email: client.email,
            password: await bcrypt.hash('123456', 10),
            firstName: 'Charlie',
            lastName: 'Client',
            userType: 'client',
            isVerified: true
        });
    }

    // 2. Ensure Freelancers Exist
    for (const f of freelancers) {
        let user = await User.findById(f.id);
        if (!user) {
            console.log(`Creating freelancer ${f.name}...`);
            user = await User.create({
                _id: f.id,
                email: f.email,
                password: await bcrypt.hash('123456', 10),
                firstName: f.name,
                lastName: 'Freelancer',
                userType: 'freelancer',
                isVerified: true
            });
            await Profile.create({
                user: f.id,
                skills: f.skills,
                bio: `Expert ${f.role}`,
                title: f.role
            });
        }
    }

    // 3. Create Collabo Project
    console.log('Creating Multi-Vendor Ecommerce Project...');
    const projectId = '660000000000000000000200';

    // Clean up existing if any
    await CollaboProject.findByIdAndDelete(projectId);
    await ProjectRole.deleteMany({ projectId });
    await CollaboWorkspace.deleteMany({ projectId });

    const project = await CollaboProject.create({
        _id: projectId,
        clientId: client.id,
        title: 'Multi-Vendor Ecommerce Platform',
        description: 'Building a scalable multi-vendor marketplace like Amazon/Etsy.',
        totalBudget: 15000,
        status: 'active',
        recommendedStack: ['Next.js', 'Node.js', 'MongoDB', 'AWS'],
        milestones: [{ title: 'MVP Launch', duration: '2 months', description: 'Core features' }]
    });

    // 4. Create Workspace
    const workspace = await CollaboWorkspace.create({
        projectId: project._id,
        channels: [{ name: 'General', roleIds: [] }]
    });
    project.workspaceId = workspace._id;
    await project.save();

    // 5. Create Roles & Invite Freelancers
    for (const f of freelancers) {
        const roleId = new mongoose.Types.ObjectId();
        const role = await ProjectRole.create({
            _id: roleId,
            projectId: project._id,
            title: f.role,
            description: `Responsible for ${f.role} tasks`,
            budget: 3000,
            skills: f.skills,
            status: 'open'
        });

        console.log(`Inviting ${f.name} to role ${f.role}...`);

        // Create Notification (Invite)
        await NotificationModel.create({
            userId: f.id,
            type: 'collabo_invite',
            title: `Team Invite: ${f.role}`,
            message: `You have been invited to join "Multi-Vendor Ecommerce Platform" as a ${f.role}.`,
            relatedId: role._id, // Role ID is key for acceptance
            relatedType: 'project',
            link: `/collabo/invite/${role._id}`,
            isRead: false
        });
    }

    console.log('✅ Seeding Complete! Automation ready.');
    process.exit(0);
};

seedCollaboTest();
