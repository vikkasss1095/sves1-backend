require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // ❌ delete old admin (fix issue)
    await User.deleteMany({ role: 'admin' });

    // ✅ create fresh admin (PLAIN password)
    const admin = await User.create({
      name: 'Super Admin',
      email: 'vikas@sves.com',
      password: 'Vikas@1095', // ⚠️ plain (model hash करेगा)
      role: 'admin',
      isApproved: true,
      isActive: true,
    });

    console.log('🔥 Admin Created:', admin.email);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();