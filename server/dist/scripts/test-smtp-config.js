import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SystemSettings from '../models/SystemSettings.model';
import { sendEmail } from '../services/email.service';
dotenv.config();
const testSMTP = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/connecta');
        console.log('Connected to MongoDB');
        // Test 1: Set provider to 'other' (mock)
        console.log('\n--- Testing "Other" Provider ---');
        await SystemSettings.findOneAndUpdate({}, {
            smtp: {
                provider: 'other',
                host: 'smtp.ethereal.email',
                port: 587,
                user: 'test_user',
                pass: 'test_pass',
                secure: false,
                fromEmail: 'test@example.com',
                fromName: 'Test Sender'
            }
        }, { upsert: true });
        // We expect this to fail authentication with fake creds, but it confirms the "other" path is taken
        // In a real scenario, we'd use a real Ethereal account, but for now we just want to see it tries to connect
        let result = await sendEmail('recipient@example.com', 'Test Subject', '<p>Test Body</p>');
        console.log('Result (Other):', result.success ? 'Success' : 'Failed as expected (invalid creds)');
        if (!result.success && result.error.includes('Invalid login')) {
            console.log('Confirmed: Attempted to connect to smtp.ethereal.email');
        }
        // Test 2: Set provider to 'gmail'
        console.log('\n--- Testing "Gmail" Provider ---');
        await SystemSettings.findOneAndUpdate({}, {
            smtp: {
                provider: 'gmail',
                user: 'test_gmail_user@gmail.com',
                pass: 'test_app_password', // Invalid, so expecting auth failure
                fromEmail: 'test_gmail_user@gmail.com',
                fromName: 'Gmail Sender'
            }
        }, { upsert: true });
        result = await sendEmail('recipient@example.com', 'Test Subject', '<p>Test Body</p>');
        console.log('Result (Gmail):', result.success ? 'Success' : 'Failed as expected (invalid creds)');
        if (!result.success && (result.error.includes('Username and Password not accepted') || result.error.includes('Invalid login'))) {
            console.log('Confirmed: Attempted to connect via Gmail service');
        }
        console.log('\nTests Completed');
    }
    catch (error) {
        console.error('Test Error:', error);
    }
    finally {
        await mongoose.disconnect();
    }
};
testSMTP();
