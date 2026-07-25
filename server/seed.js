require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const connectDB = require('./src/config/db');

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@leadflow.com',
    password: 'Admin@123',
    role: 'admin',
  },
  {
    name: 'Team Member',
    email: 'member@leadflow.com',
    password: 'Member@123',
    role: 'member',
  },
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log('🌱 Seeding database...\n');

    // Clear existing users
    await User.deleteMany({});
    console.log('  ✓ Cleared existing users');

    // Create users
    for (const userData of seedUsers) {
      const user = await User.create(userData);
      console.log(`  ✓ Created ${user.role}: ${user.email} (password: ${userData.password})`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('  Admin: admin@leadflow.com / Admin@123');
    console.log('  Member: member@leadflow.com / Member@123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();
