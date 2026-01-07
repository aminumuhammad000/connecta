import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { verifyEmailConfig, sendEmail } from '../src/services/email.service';

dotenv.config();

const testEmail = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/connecta');
        console.log('Connected to MongoDB');

        console.log('Verifying email configuration...');
        const isConfigValid = await verifyEmailConfig();

        if (isConfigValid) {
            console.log('✅ Email configuration is VALID.');
            console.log('Attempting to send a test email...');

            const result = await sendEmail(
                'connectagigs@gmail.com', // Send to self
                'Test Email from Script',
                '<p>This is a test email to verify credentials.</p>',
                'This is a test email to verify credentials.'
            );

            if (result.success) {
                console.log('✅ Test email sent successfully!');
            } else {
                console.error('❌ Failed to send test email:', result.error);
            }
        } else {
            console.error('❌ Email configuration is INVALID (Auth failed).');
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error running test:', error);
        process.exit(1);
    }
};

testEmail();
