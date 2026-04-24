const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config();

// Routes
const authRoutes = require('./routes/auth');
const vendorRoutes = require('./routes/vendor');
const adminRoutes = require('./routes/admin');
const taskRoutes = require('./routes/task');
const paymentRoutes = require('./routes/payment');
const notificationRoutes = require('./routes/notification');

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());

// CORS FIX (Production + Local both)
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL, // Vercel URL
    ],
    credentials: true,
  })
);

// Static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================= ROUTES =================
app.get('/', (req, res) => {
  res.send('SVES1 Backend is Running 🚀');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'SVES1 API running ✅' });
});

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

// ================= DATABASE CONNECT =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });