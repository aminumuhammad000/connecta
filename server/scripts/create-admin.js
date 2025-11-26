const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema
const UserSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      enum: ["admin", "freelancer", "employer", "client"],
      required: true,
      default: "freelancer",
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, required: false },
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);

// Admin users to create
const adminUsers = [
  {
    email: 'admin@connecta.com',
    password: 'demo1234',
    firstName: 'Admin',
    lastName: 'User'
  },
  {
    email: 'safe@admin.com',
    password: 'imsafe',
    firstName: 'Safe',
    lastName: 'Admin'
  }
];

async function createAdmins() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/connecta';
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    let createdCount = 0;
    let skippedCount = 0;

    for (const adminData of adminUsers) {
      // Check if admin already exists
      const existingAdmin = await User.findOne({ email: adminData.email });
      if (existingAdmin) {
        console.log(`⚠️  Admin already exists: ${adminData.email}`);
        skippedCount++;
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(adminData.password, 10);

      // Create admin user
      const admin = await User.create({
        userType: 'admin',
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        email: adminData.email,
        password: hashedPassword,
        profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(adminData.firstName + ' ' + adminData.lastName)}&background=fd6730&color=fff&size=256`,
      });

      console.log('✅ Admin user created successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:', admin.email);
      console.log('🔑 Password:', adminData.password);
      console.log('👤 Name:', `${admin.firstName} ${admin.lastName}`);
      console.log('🆔 ID:', admin._id);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      createdCount++;
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Created: ${createdCount} admin user(s)`);
    console.log(`⚠️  Skipped: ${skippedCount} (already exists)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎯 You can now login with any of these accounts:');
    adminUsers.forEach(admin => {
      console.log(`   📧 ${admin.email} / 🔑 ${admin.password}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error creating admins:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createAdmins();
