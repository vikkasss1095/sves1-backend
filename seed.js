require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB...');

    // ================= ADMIN =================
    const adminEmail = 'vikas@sves.com';
    const adminPassword = await bcrypt.hash('Vikas@1095', 10);

    const admin = await User.findOne({ role: 'admin' });

    if (admin) {
      // 🔁 UPDATE ADMIN
      admin.email = adminEmail;
      admin.password = adminPassword;
      admin.name = 'Super Admin';
      admin.isApproved = true;
      admin.isActive = true;
      await admin.save();

      console.log('✅ Admin UPDATED → vikas@sves.com / Vikas@1095');
    } else {
      // 🆕 CREATE ADMIN
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isApproved: true,
        isActive: true,
        companyName: 'SVES1 Admin',
        phone: '+91 9999999999',
      });

      console.log('✅ Admin CREATED → vikas@sves.com / Vikas@1095');
    }

    // ================= VENDOR =================
    const vendorEmail = 'vendor@sves1.com';
    const vendorPassword = await bcrypt.hash('Vendor@123', 10);

    const vendor = await User.findOne({ email: vendorEmail });

    if (vendor) {
      // 🔁 UPDATE VENDOR
      vendor.password = vendorPassword;
      vendor.isApproved = true;
      vendor.isActive = true;
      await vendor.save();

      console.log('✅ Vendor UPDATED → vendor@sves1.com / Vendor@123');
    } else {
      // 🆕 CREATE VENDOR
      await User.create({
        name: 'Demo Vendor',
        email: vendorEmail,
        password: vendorPassword,
        role: 'vendor',
        isApproved: true,
        isActive: true,
        companyName: 'Demo Pvt. Ltd.',
        phone: '+91 8888888888',
        gstNumber: '22AAAAA0000A1Z5',
      });

      console.log('✅ Vendor CREATED → vendor@sves1.com / Vendor@123');
    }

    console.log('\n🎉 Seed complete');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();