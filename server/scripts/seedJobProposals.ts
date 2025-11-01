import dotenv from 'dotenv';
import connectDB from '../src/config/db.config';
import Proposal from '../src/models/Proposal.model';
import User from '../src/models/user.model';
import Job from '../src/models/Job.model';

dotenv.config();

const seedJobProposals = async () => {
  try {
    await connectDB();
    console.log('🔗 Connected to database');

    // Find all freelancers
    const freelancers = await User.find({ userType: 'freelancer' });
    
    if (freelancers.length === 0) {
      console.log('❌ No freelancers found in database');
      process.exit(1);
    }

    console.log(`✅ Found ${freelancers.length} freelancers`);

    // Get the latest job (most recently created)
    const latestJob = await Job.findOne()
      .sort({ createdAt: -1 })
      .populate('clientId', 'firstName lastName email');

    if (!latestJob) {
      console.log('❌ No jobs found in database. Please create a job first.');
      process.exit(1);
    }

    console.log(`✅ Found latest job: "${latestJob.title}" by ${(latestJob.clientId as any).firstName}`);

    // Clear existing proposals for this job
    await Proposal.deleteMany({ jobId: latestJob._id });
    console.log('✅ Cleared existing proposals for this job');

    // Create proposals for each freelancer
    const proposals = freelancers.map((freelancer, index) => {
      // Calculate a slightly varied proposed rate
      const baseRate = latestJob.budget ? parseInt(latestJob.budget.replace(/[^0-9]/g, '')) || 5000 : 5000;
      const proposedRate = baseRate + (index * 500);

      // Vary estimated duration
      const durations = ['1 week', '2 weeks', '1 month', '2 months', '3 months'];
      const estimatedDuration = durations[index % durations.length];

      return {
        title: latestJob.title,
        recommended: true,
        description: latestJob.description,
        budget: {
          amount: proposedRate,
          currency: '$',
        },
        dateRange: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        },
        type: 'recommendation' as const,
        freelancerId: freelancer._id,
        jobId: latestJob._id,
        clientId: latestJob.clientId,
        status: 'pending' as const,
        level: latestJob.experience.toLowerCase().includes('senior') ? 'expert' : 
               latestJob.experience.toLowerCase().includes('mid') ? 'intermediate' : 'entry',
        priceType: latestJob.jobType === 'freelance' ? 'fixed' as const : 'hourly' as const,
      };
    });

    const createdProposals = await Proposal.insertMany(proposals);
    console.log(`✅ Successfully created ${createdProposals.length} proposals`);
    console.log(`   - Job: ${latestJob.title}`);
    console.log(`   - Client: ${(latestJob.clientId as any).firstName} ${(latestJob.clientId as any).lastName}`);
    console.log(`   - Freelancers can view at: /freelancer/proposals`);
    console.log(`   - After acceptance, client can view at: /client/projects (Proposals tab)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding proposals:', error);
    process.exit(1);
  }
};

seedJobProposals();
