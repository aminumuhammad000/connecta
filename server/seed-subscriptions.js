const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/connecta');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['free', 'premium'], default: 'free' },
  amount: { type: Number, required: true, default: 0 },
  currency: { type: String, default: 'NGN' },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
  startDate: { type: Date, required: true, default: Date.now },
  endDate: { type: Date, required: true },
  paymentReference: { type: String },
  autoRenew: { type: Boolean, default: false }
}, { timestamps: true });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

async function seedSubscriptions() {
  try {
    // Get some users
    const users = await User.find().limit(5);
    
    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      process.exit(1);
    }

    // Clear existing subscriptions
    await Subscription.deleteMany({});
    console.log('Cleared existing subscriptions');

    const subscriptions = [];
    
    // Create 3 active subscriptions (recent)
    for (let i = 0; i < Math.min(3, users.length); i++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (i * 3)); // Stagger over last 9 days
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);

      subscriptions.push({
        userId: users[i]._id,
        plan: 'premium',
        amount: 5000,
        currency: 'NGN',
        status: 'active',
        startDate,
        endDate,
        paymentReference: `PAY-${Date.now()}-${i}`,
        autoRenew: false
      });

      // Update user to premium
      await User.updateOne(
        { _id: users[i]._id },
        { 
          $set: { 
            isPremium: true,
            premiumExpiryDate: endDate
          }
        }
      );
    }

    // Create 1 expired subscription
    if (users.length > 3) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 40);
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);

      subscriptions.push({
        userId: users[3]._id,
        plan: 'premium',
        amount: 5000,
        currency: 'NGN',
        status: 'expired',
        startDate,
        endDate,
        paymentReference: `PAY-${Date.now()}-EXP`,
        autoRenew: false
      });
    }

    // Create 1 cancelled subscription
    if (users.length > 4) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 15);
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);

      subscriptions.push({
        userId: users[4]._id,
        plan: 'premium',
        amount: 5000,
        currency: 'NGN',
        status: 'cancelled',
        startDate,
        endDate,
        paymentReference: `PAY-${Date.now()}-CAN`,
        autoRenew: false
      });
    }

    await Subscription.insertMany(subscriptions);
    
    console.log(`✓ Created ${subscriptions.length} subscriptions:`);
    console.log(`  - ${subscriptions.filter(s => s.status === 'active').length} active`);
    console.log(`  - ${subscriptions.filter(s => s.status === 'expired').length} expired`);
    console.log(`  - ${subscriptions.filter(s => s.status === 'cancelled').length} cancelled`);
    console.log(`  - Total revenue: ₦${subscriptions.reduce((sum, s) => sum + s.amount, 0).toLocaleString()}`);
    console.log(`✓ Updated ${Math.min(3, users.length)} users to premium status`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding subscriptions:', error);
    process.exit(1);
  }
}

seedSubscriptions();
