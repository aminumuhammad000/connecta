import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { sendEmail } from '../services/email.service';
import connectDB from '../config/db.config';

dotenv.config();

const testBroadcastEmail = async () => {
    try {
        // Connect to database
        await connectDB();
        console.log('Connected to database');

        const testEmail = 'aminumuhammad00015@gmail.com';
        const subject = 'Test Broadcast Email';
        const html = `
      <h1>Broadcast Test</h1>
      <p>This is a test email to verify the broadcast email functionality.</p>
      <p>If you received this, the email service is working correctly.</p>
    `;
        const text = 'This is a test email to verify the broadcast email functionality.';

        console.log(`Sending test email to ${testEmail}...`);
        const result = await sendEmail(testEmail, subject, html, text);

        if (result.success) {
            console.log('✅ Test email sent successfully!');
        } else {
            console.error('❌ Failed to send test email:', result.error);
        }

    } catch (error) {
        console.error('❌ Error running test:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database');
        process.exit(0);
    }
};

testBroadcastEmail();
