
import mongoose from 'mongoose';
import Notification from './src/models/Notification.model';
import User from './src/models/user.model';
import connectDB from './src/config/db.config';

const checkNotifications = async () => {
    await connectDB();

    const emails = ['a@gmail.com', 'b@gmail.com', 'd@gmail.com', 'f@gmail.com', 'c@gmail.com'];

    for (const email of emails) {
        const user = await User.findOne({ email });
        if (!user) {
            console.log(`❌ User ${email} NOT FOUND`);
            continue;
        }

        const count = await Notification.countDocuments({ userId: user._id });
        const invites = await Notification.find({ userId: user._id, type: 'collabo_invite' });

        console.log(`\n👤 User: ${email} (${user._id})`);
        console.log(`   - Total Notifications: ${count}`);
        console.log(`   - Collabo Invites: ${invites.length}`);
        invites.forEach(inv => {
            console.log(`     -> ${inv.title}: ${inv.message}`);
        });
    }

    process.exit(0);
};

checkNotifications();
