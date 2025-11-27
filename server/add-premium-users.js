const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/connecta');

const userSchema = new mongoose.Schema({}, { strict: false });
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

const User = mongoose.model('User', userSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);

async function addPremiumUsers() {
  try {
    const newUsers = [];
    
    // Add 3 premium clients
    const premiumClients = [
      {
        firstName: 'Chukwudi',
        lastName: 'Okonkwo',
        email: 'chukwudi.okonkwo@example.com',
        password: '$2a$10$example_hashed_password',
        userType: 'client',
        phone: '+234 806 123 4567',
        location: 'Lagos, Nigeria',
        isVerified: true,
        isActive: true,
        rating: 4.9,
        isPremium: true,
        profileImage: 'https://ui-avatars.com/api/?name=Chukwudi+Okonkwo&background=4f46e5&color=fff&size=256',
        createdAt: new Date('2024-08-10'),
        updatedAt: new Date('2024-08-10')
      },
      {
        firstName: 'Blessing',
        lastName: 'Adeyemi',
        email: 'blessing.adeyemi@example.com',
        password: '$2a$10$example_hashed_password',
        userType: 'client',
        phone: '+234 807 234 5678',
        location: 'Abuja, Nigeria',
        isVerified: true,
        isActive: true,
        rating: 4.7,
        isPremium: true,
        profileImage: 'https://ui-avatars.com/api/?name=Blessing+Adeyemi&background=ec4899&color=fff&size=256',
        createdAt: new Date('2024-09-15'),
        updatedAt: new Date('2024-09-15')
      },
      {
        firstName: 'Emeka',
        lastName: 'Nwosu',
        email: 'emeka.nwosu@example.com',
        password: '$2a$10$example_hashed_password',
        userType: 'client',
        phone: '+234 808 345 6789',
        location: 'Port Harcourt, Nigeria',
        isVerified: true,
        isActive: true,
        rating: 4.8,
        isPremium: true,
        profileImage: 'https://ui-avatars.com/api/?name=Emeka+Nwosu&background=8b5cf6&color=fff&size=256',
        createdAt: new Date('2024-10-05'),
        updatedAt: new Date('2024-10-05')
      }
    ];

    // Add 2 premium freelancers
    const premiumFreelancers = [
      {
        firstName: 'Chidinma',
        lastName: 'Eze',
        email: 'chidinma.eze@example.com',
        password: '$2a$10$example_hashed_password',
        userType: 'freelancer',
        phone: '+234 809 456 7890',
        location: 'Enugu, Nigeria',
        isVerified: true,
        isActive: true,
        rating: 4.9,
        isPremium: true,
        profileImage: 'https://ui-avatars.com/api/?name=Chidinma+Eze&background=10b981&color=fff&size=256',
        createdAt: new Date('2024-07-20'),
        updatedAt: new Date('2024-07-20')
      },
      {
        firstName: 'Oluwaseun',
        lastName: 'Ajayi',
        email: 'oluwaseun.ajayi@example.com',
        password: '$2a$10$example_hashed_password',
        userType: 'freelancer',
        phone: '+234 810 567 8901',
        location: 'Ibadan, Nigeria',
        isVerified: true,
        isActive: true,
        rating: 4.8,
        isPremium: true,
        profileImage: 'https://ui-avatars.com/api/?name=Oluwaseun+Ajayi&background=f59e0b&color=fff&size=256',
        createdAt: new Date('2024-08-25'),
        updatedAt: new Date('2024-08-25')
      }
    ];

    // Insert users
    const allNewUsers = [...premiumClients, ...premiumFreelancers];
    const insertedUsers = await User.insertMany(allNewUsers);
    console.log(`✓ Created ${insertedUsers.length} new premium users`);
    console.log(`  - ${premiumClients.length} premium clients`);
    console.log(`  - ${premiumFreelancers.length} premium freelancers`);

    // Create active subscriptions for all new users
    const subscriptions = insertedUsers.map((user, index) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (index * 2)); // Stagger subscription dates
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);
      
      // Update user with premium expiry date
      user.premiumExpiryDate = endDate;
      
      return {
        userId: user._id,
        plan: 'premium',
        amount: 5000,
        currency: 'NGN',
        status: 'active',
        startDate,
        endDate,
        paymentReference: `PAY-${Date.now()}-${index}`,
        autoRenew: false
      };
    });

    // Update users with premium expiry dates
    await Promise.all(insertedUsers.map(user => 
      User.updateOne({ _id: user._id }, { $set: { premiumExpiryDate: user.premiumExpiryDate } })
    ));

    // Insert subscriptions
    await Subscription.insertMany(subscriptions);
    console.log(`✓ Created ${subscriptions.length} active subscriptions`);
    console.log(`✓ Total subscription revenue: ₦${(subscriptions.length * 5000).toLocaleString()}`);

    // Display summary
    const totalPremiumUsers = await User.countDocuments({ isPremium: true });
    const totalActiveSubscriptions = await Subscription.countDocuments({ status: 'active' });
    console.log('\n📊 Platform Summary:');
    console.log(`   Total premium users: ${totalPremiumUsers}`);
    console.log(`   Active subscriptions: ${totalActiveSubscriptions}`);
    console.log(`   Total subscription revenue: ₦${(totalActiveSubscriptions * 5000).toLocaleString()}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addPremiumUsers();
