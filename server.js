require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ================= MIDDLEWARE =================

// JSON
app.use(express.json());

// 🔥🔥 FINAL CORS FIX (NO ERROR)
app.use(
  cors({
    origin: true, // sab allow (best for now)
    credentials: true,
  })
);

// ================= ROUTES IMPORT =================
// const authRoutes = require('./routes/auth');
// const vendorRoutes = require('./routes/vendor');
// const adminRoutes = require('./routes/admin');
// const taskRoutes = require('./routes/task');
// const paymentRoutes = require('./routes/payment');
// const notificationRoutes = require('./routes/notification');

// ================= STATIC =================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================= TEST ROUTES =================
app.get('/', (req, res) => {
  res.send('SVES1 Backend is Running 🚀');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'SVES1 API running ✅' });
});

// ================= MAIN ROUTES =================
app.use('/api/auth', authRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

// ================= DATABASE =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });