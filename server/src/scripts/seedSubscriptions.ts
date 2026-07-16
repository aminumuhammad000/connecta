import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Subscription from '../models/Subscription.model.js';
import User from '../models/user.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedSubscriptions = async () => {
  try {
    const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/connecta';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({}).limit(5);

    if (users.length === 0) {
      console.log('No users found. Run user seed script first.');
      process.exit(1);
    }

    await Subscription.deleteMany({});

    const currentDate = new Date();
    const oneMonthFromNow = new Date(currentDate);
    oneMonthFromNow.setMonth(currentDate.getMonth() + 1);

    const twoMonthsAgo = new Date(currentDate);
    twoMonthsAgo.setMonth(currentDate.getMonth() - 2);

    const oneMonthAgo = new Date(currentDate);
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);

    const subscriptions = [
      {
        userId: users[0]._id,
        plan: 'premium',
        amount: 5000,
        currency: 'NGN',
        status: 'active',
        startDate: currentDate,
        endDate: oneMonthFromNow,
        paymentReference: 'SUB-' + Date.now() + '-1',
        autoRenew: true,
      },
      {
        userId: users[1] ? users[1]._id : users[0]._id,
        plan: 'basic',
        amount: 2000,
        currency: 'NGN',
        status: 'expired',
        startDate: twoMonthsAgo,
        endDate: oneMonthAgo,
        paymentReference: 'SUB-' + Date.now() + '-2',
        autoRenew: false,
      },
      {
        userId: users[2] ? users[2]._id : users[0]._id,
        plan: 'enterprise',
        amount: 15000,
        currency: 'NGN',
        status: 'cancelled',
        startDate: oneMonthAgo,
        endDate: currentDate,
        paymentReference: 'SUB-' + Date.now() + '-3',
        autoRenew: false,
      },
      {
        userId: users[3] ? users[3]._id : users[0]._id,
        plan: 'premium',
        amount: 5000,
        currency: 'NGN',
        status: 'active',
        startDate: new Date(currentDate.getTime() - 1000000000), // Some days ago
        endDate: new Date(oneMonthFromNow.getTime() - 1000000000),
        paymentReference: 'SUB-' + Date.now() + '-4',
        autoRenew: true,
      }
    ];

    await Subscription.insertMany(subscriptions);

    console.log('Successfully seeded subscriptions');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding subscriptions:', error);
    process.exit(1);
  }
};

seedSubscriptions();
