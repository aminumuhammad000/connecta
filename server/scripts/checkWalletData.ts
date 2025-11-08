import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkData = async () => {
  try {
    await connectDB();

    const Proposal = require('../src/models/Proposal.model').default;
    const Project = require('../src/models/Project.model').default;
    const Payment = require('../src/models/Payment.model').default;
    const User = require('../src/models/user.model').default;

    console.log('\n📊 Checking Database Status...\n');

    // Check proposals
    const proposals = await Proposal.find().populate('freelancerId', 'firstName lastName email');
    console.log(`📝 Total Proposals: ${proposals.length}`);
    
    const approvedProposals = proposals.filter((p: any) => p.status === 'approved');
    console.log(`✅ Approved Proposals: ${approvedProposals.length}`);
    
    if (approvedProposals.length > 0) {
      console.log('\nApproved Proposals:');
      approvedProposals.forEach((p: any) => {
        console.log(`  - ${p.title} by ${p.freelancerId.firstName} ${p.freelancerId.lastName}`);
      });
    }

    // Check projects
    const projects = await Project.find().populate('freelancerId', 'firstName lastName email');
    console.log(`\n🚀 Total Projects: ${projects.length}`);
    
    if (projects.length > 0) {
      console.log('\nProjects:');
      projects.forEach((p: any) => {
        console.log(`  - ${p.title} (${p.status})`);
        console.log(`    Freelancer: ${p.freelancerId.firstName} ${p.freelancerId.lastName}`);
        console.log(`    Budget: ${p.budget.currency}${p.budget.amount}`);
      });
    }

    // Check payments
    const payments = await Payment.find().populate('payeeId', 'firstName lastName email');
    console.log(`\n💰 Total Payments: ${payments.length}`);
    
    const pendingPayments = payments.filter((p: any) => p.status === 'pending');
    console.log(`⏳ Pending Payments: ${pendingPayments.length}`);
    
    const completedPayments = payments.filter((p: any) => p.status === 'completed');
    console.log(`✅ Completed Payments: ${completedPayments.length}`);
    
    if (payments.length > 0) {
      console.log('\nPayment Details:');
      payments.forEach((p: any) => {
        console.log(`  - ${p.description || 'Payment'}`);
        console.log(`    To: ${p.payeeId?.firstName} ${p.payeeId?.lastName || 'Unknown'}`);
        console.log(`    Amount: ${p.currency}${p.amount}`);
        console.log(`    Status: ${p.status}`);
        console.log(`    Escrow Status: ${p.escrowStatus}`);
        console.log(`    Project ID: ${p.projectId}`);
      });
    }

    // Check freelancers
    const freelancers = await User.find({ userType: 'freelancer' }).select('firstName lastName email');
    console.log(`\n👥 Total Freelancers: ${freelancers.length}`);

    if (freelancers.length > 0 && projects.length > 0) {
      console.log('\n🔍 Checking Wallet Data for Freelancers:');
      for (const freelancer of freelancers) {
        const userProjects = await Project.find({ 
          freelancerId: freelancer._id,
          status: 'ongoing'
        });
        
        const userPayments = await Payment.find({
          payeeId: freelancer._id
        });

        if (userProjects.length > 0 || userPayments.length > 0) {
          console.log(`\n  ${freelancer.firstName} ${freelancer.lastName} (${freelancer.email})`);
          console.log(`    Ongoing Projects: ${userProjects.length}`);
          console.log(`    Total Payments: ${userPayments.length}`);
          
          const pendingPay = userPayments.filter((p: any) => p.status === 'pending');
          const escrowPay = userPayments.filter((p: any) => p.status === 'completed' && p.escrowStatus === 'held');
          
          if (pendingPay.length > 0) {
            const pendingAmount = pendingPay.reduce((sum: number, p: any) => sum + p.amount, 0);
            console.log(`    ⏳ Pending Payments: ${pendingAmount} NGN`);
          }
          
          if (escrowPay.length > 0) {
            const escrowAmount = escrowPay.reduce((sum: number, p: any) => sum + p.netAmount, 0);
            console.log(`    🔒 In Escrow: ${escrowAmount} NGN`);
          }
        }
      }
    }

    console.log('\n\n💡 Next Steps:');
    console.log('================');
    if (approvedProposals.length === 0) {
      console.log('❌ No approved proposals found!');
      console.log('   Solution: Login as client and approve a proposal at /client/projects');
    } else if (projects.length === 0) {
      console.log('❌ Proposals approved but no projects created!');
      console.log('   Solution: Check Proposal.controller.ts approveProposal function');
    } else if (pendingPayments.length === 0) {
      console.log('❌ Projects exist but no pending payments!');
      console.log('   Solution: Check if Payment.create() is working in approveProposal');
    } else {
      console.log('✅ Data looks good!');
      console.log('   Login as freelancer and check /freelancer/wallet');
      console.log(`   You should see pending payment: ${pendingPayments[0].amount} ${pendingPayments[0].currency}`);
    }

    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkData();
