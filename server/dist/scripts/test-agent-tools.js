import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ConnectaAgent } from '../core/ai/connecta-agent/agent.js';
import User from '../models/user.model.js';
dotenv.config();
async function testAgent() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI not found in environment variables');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        // Find a test user (or create a mock context)
        const user = await User.findOne({ email: 'freelancer@example.com' }); // Adjust email as needed
        if (!user) {
            console.log('⚠️ Test user not found, using mock ID');
        }
        const userId = user?._id.toString() || '65a1234567890abcdef12345';
        console.log('🤖 Initializing Agent...');
        const agent = new ConnectaAgent({
            apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000',
            authToken: '', // No auth token for testing
            userId,
            mockMode: false,
        });
        await agent.initialize();
        console.log('✅ Agent Initialized');
        // Test 1: Profile Details
        console.log('\n🧪 Test 1: "Show my profile"');
        const res1 = await agent.process("Show my profile");
        console.log('Result:', JSON.stringify(res1, null, 2));
        // Test 2: Find Gigs
        console.log('\n🧪 Test 2: "Find React gigs"');
        const res2 = await agent.process("Find React gigs");
        console.log('Result:', JSON.stringify(res2, null, 2));
        // Test 3: General Chat
        console.log('\n🧪 Test 3: "Hello, who are you?"');
        const res3 = await agent.process("Hello, who are you?");
        console.log('Result:', JSON.stringify(res3, null, 2));
    }
    catch (error) {
        console.error('❌ Test Failed:', error);
    }
    finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected');
    }
}
testAgent();
