import mongoose from 'mongoose';
import SystemSettings from '../src/models/SystemSettings.model';
import dotenv from 'dotenv';

dotenv.config();

const updateSmtpSettings = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/connecta');
    console.log('Connected to MongoDB');

    const smtpSettings = {
      provider: 'gmail',
      user: 'connectagigs@gmail.com',
      pass: 'nklv zxsy cxvb psgd', // New app password
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      fromName: 'Connecta Admin',
      fromEmail: 'connectagigs@gmail.com'
    };

    // Find and update, or create if not exists
    const settings = await SystemSettings.findOneAndUpdate(
      {},
      { $set: { smtp: smtpSettings } },
      { new: true, upsert: true }
    );

    console.log('✅ SMTP Settings updated successfully:');
    console.log(JSON.stringify(settings.smtp, null, 2));

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error updating settings:', error);
    process.exit(1);
  }
};

updateSmtpSettings();
