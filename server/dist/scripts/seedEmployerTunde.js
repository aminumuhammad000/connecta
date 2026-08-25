import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import { Job } from '../models/Job.model.js';
import Proposal from '../models/Proposal.model.js';
import WorkforceMember from '../models/WorkforceMember.model.js';
import WorkforcePayment from '../models/WorkforcePayment.model.js';
dotenv.config();
async function seedEmployerTundeData() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/connecta';
        console.log('🔌 Connecting to MongoDB...', mongoUri);
        await mongoose.connect(mongoUri);
        // 1. Find or Create Tunde Employer Account
        let tunde = await User.findOne({ email: 'tunde@payflow.ng' });
        const passwordHash = await bcrypt.hash('Password123!', 10);
        if (!tunde) {
            tunde = await User.create({
                firstName: 'Tunde',
                lastName: 'Bakare',
                email: 'tunde@payflow.ng',
                password: passwordHash,
                userType: 'client',
                companyName: 'PayFlow Financial & Logistics',
                title: 'Managing Director',
                location: 'Lagos, Nigeria',
                profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                isVerified: true,
            });
            console.log('✅ Created employer account for tunde@payflow.ng');
        }
        else {
            tunde.password = passwordHash;
            tunde.companyName = 'PayFlow Financial & Logistics';
            await tunde.save();
            console.log('✅ Found existing employer account:', tunde._id);
        }
        const companyId = tunde._id;
        // 2. Find or Create Sample Worker Accounts
        const sampleWorkersData = [
            { firstName: 'Emmanuel', lastName: 'Adeyemi', email: 'emmanuel.ade@worker.ng', phone: '08031234567', role: 'Senior Site Operations Lead', pay: 280000 },
            { firstName: 'Fatima', lastName: 'Bello', email: 'fatima.bello@worker.ng', phone: '08059876543', role: 'Logistics & Dispatch Supervisor', pay: 220000 },
            { firstName: 'Chidi', lastName: 'Okafor', email: 'chidi.okafor@worker.ng', phone: '08023456789', role: 'Solar Installation Engineer', pay: 350000 },
            { firstName: 'Blessing', lastName: 'Eze', email: 'blessing.eze@worker.ng', phone: '08071122334', role: 'Quality Assurance Inspector', pay: 190000 },
            { firstName: 'Kadir', lastName: 'Usman', email: 'kadir.usman@worker.ng', phone: '08098877665', role: 'Heavy Equipment Maintenance Tech', pay: 310000 },
            { firstName: 'Grace', lastName: 'Danladi', email: 'grace.danladi@worker.ng', phone: '08064433221', role: 'Inventory & Stock Officer', pay: 175000 },
        ];
        const workerUsers = [];
        for (const w of sampleWorkersData) {
            let workerUser = await User.findOne({ email: w.email });
            if (!workerUser) {
                workerUser = await User.create({
                    firstName: w.firstName,
                    lastName: w.lastName,
                    email: w.email,
                    phoneNumber: w.phone,
                    password: passwordHash,
                    userType: 'freelancer',
                    profileImage: `https://i.pravatar.cc/300?u=${w.email}`,
                    isVerified: true,
                });
            }
            workerUsers.push(workerUser);
        }
        // 3. Clear existing workforce data for Tunde
        await WorkforceMember.deleteMany({ companyId });
        await Job.deleteMany({ clientId: companyId });
        await WorkforcePayment.deleteMany({ companyId });
        console.log('🧹 Cleared existing data for Tunde...');
        // 4. Seed Workforce Members (Employees Roster)
        const seededMembers = [];
        for (let i = 0; i < sampleWorkersData.length; i++) {
            const wData = sampleWorkersData[i];
            const wUser = workerUsers[i];
            const member = await WorkforceMember.create({
                companyId,
                workerId: wUser._id,
                fullName: `${wData.firstName} ${wData.lastName}`,
                email: wData.email,
                phone: wData.phone,
                role: wData.role,
                status: i === 5 ? 'inactive' : 'active',
                inviteStatus: 'accepted',
                companyRole: 'worker',
                paymentAmount: wData.pay,
                paymentType: 'monthly',
                currency: 'NGN',
                location: 'Lagos, NG',
                joinedAt: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000),
            });
            seededMembers.push(member);
        }
        console.log(`✅ Seeded ${seededMembers.length} active employees on Tunde's roster`);
        // 5. Seed Employer Jobs
        const jobsData = [
            {
                title: 'Senior Solar Systems Installation Contractor',
                description: 'Lead solar panel array installation, inverter wiring, and grid synchronization across commercial sites in Lagos.',
                budget: 350000,
                jobType: 'contract',
                category: 'Construction & Engineering',
                location: 'Lagos, Nigeria',
                skills: ['Solar PV', 'Electrical Wiring', 'High Voltage Safety'],
            },
            {
                title: 'Logistics & Fleet Dispatch Officer',
                description: 'Supervise daily truck dispatches, route optimization, and delivery tracking across Southwest distribution routes.',
                budget: 240000,
                jobType: 'milestone_gig',
                category: 'Logistics & Supply',
                location: 'Ibadan, Nigeria',
                skills: ['Fleet Management', 'GPS Tracking', 'Logistics'],
            },
            {
                title: 'Industrial Safety & Inspection Specialist',
                description: 'Conduct HSE audits, worker safety training, and site compliance verifications for warehouse operations.',
                budget: 280000,
                jobType: 'contract',
                category: 'Security & Cleaning',
                location: 'Abuja, Nigeria',
                skills: ['HSE Certification', 'Safety Audit', 'Hazard Mgmt'],
            },
            {
                title: 'Daily Site Equipment Maintenance Technician',
                description: 'Daily inspection and preventative maintenance of diesel generators, hydraulic pumps, and site machinery.',
                budget: 180000,
                jobType: 'contract',
                category: 'Construction & Engineering',
                location: 'Port Harcourt, Nigeria',
                skills: ['Hydraulics', 'Diesel Generators', 'Maintenance'],
            },
        ];
        const seededJobs = [];
        for (const jData of jobsData) {
            const job = await Job.create({
                ...jData,
                clientId: companyId,
                company: 'PayFlow Financial & Logistics',
                duration: 30,
                status: 'active',
                paymentVerified: true,
            });
            seededJobs.push(job);
        }
        console.log(`✅ Seeded ${seededJobs.length} jobs for Tunde`);
        // 6. Seed Applications / Proposals for Jobs (so "View Applicants & Hire" works!)
        let proposalCount = 0;
        for (const job of seededJobs) {
            // Pick 2 workers per job to submit proposals
            const applicants = workerUsers.slice(0, 3);
            for (const applicant of applicants) {
                await Proposal.create({
                    jobId: job._id,
                    clientId: companyId,
                    freelancerId: applicant._id,
                    description: `I am highly experienced in ${job.title}. Ready to start immediately with full dedication!`,
                    price: job.budget,
                    deliveryTime: 30,
                    status: 'pending',
                });
                proposalCount++;
            }
        }
        console.log(`✅ Seeded ${proposalCount} proposals ready for review in "View Applicants & Hire"`);
        // 7. Seed Payroll Payout Records (for Payroll Page)
        const payrollRecords = [
            { member: seededMembers[0], amount: 280000, desc: 'Monthly Salary Settlement - Emmanuel Adeyemi', date: new Date('2026-08-01') },
            { member: seededMembers[1], amount: 220000, desc: 'Monthly Salary Settlement - Fatima Bello', date: new Date('2026-08-01') },
            { member: seededMembers[2], amount: 350000, desc: 'Project Completion Bonus & Payroll - Chidi Okafor', date: new Date('2026-08-05') },
            { member: seededMembers[3], amount: 190000, desc: 'Monthly Salary Settlement - Blessing Eze', date: new Date('2026-08-10') },
            { member: seededMembers[4], amount: 310000, desc: 'Monthly Salary Settlement - Kadir Usman', date: new Date('2026-08-15') },
        ];
        for (const pr of payrollRecords) {
            await WorkforcePayment.create({
                companyId,
                workforceMemberId: pr.member._id,
                workerId: pr.member.workerId,
                amount: pr.amount,
                currency: 'NGN',
                paymentType: 'monthly',
                status: 'completed',
                description: pr.desc,
                paymentDate: pr.date,
                reference: `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            });
        }
        console.log(`✅ Seeded ${payrollRecords.length} completed payroll payouts`);
        console.log('\n🎉 ALL DASHBOARD DATA SEEDED SUCCESSFULLY FOR tunde@payflow.ng!');
        process.exit(0);
    }
    catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}
seedEmployerTundeData();
