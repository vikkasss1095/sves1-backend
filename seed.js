require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Create admin
    const adminExists = await User.findOne({ email: 'admin@sves1.com' });
    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@sves1.com',
        password: 'Admin@123',
        role: 'admin',
        isApproved: true,
        isActive: true,
        companyName: 'SVES1 Admin',
        phone: '+91 9999999999',
      });
      console.log('✅ Admin created  →  admin@sves1.com  /  Admin@123');
    } else {
      console.log('ℹ️  Admin already exists');
    }

    // Create demo vendor
    const vendorExists = await User.findOne({ email: 'vendor@sves1.com' });
    if (!vendorExists) {
      await User.create({
        name: 'Demo Vendor',
        email: 'vendor@sves1.com',
        password: 'Vendor@123',
        role: 'vendor',
        isApproved: true,
        isActive: true,
        companyName: 'Demo Pvt. Ltd.',
        phone: '+91 8888888888',
        gstNumber: '22AAAAA0000A1Z5',
      });
      console.log('✅ Demo vendor created  →  vendor@sves1.com  /  Vendor@123');
    } else {
      console.log('ℹ️  Demo vendor already exists');
    }

    console.log('\n🎉 Seed complete. Run: npm run dev');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();