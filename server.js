require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const compression = require("compression");

const app = express();

// ================= PERFORMANCE =================

// gzip compression
app.use(compression());

// JSON limit
app.use(express.json({ limit: "10mb" }));

// ================= CORS =================

app.use(
  cors({
    origin: [
      "https://sves1-frontend.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

// ================= STATIC FILES =================

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= ROUTES IMPORT =================

const authRoutes = require("./routes/auth");
const vendorRoutes = require("./routes/vendor");
const adminRoutes = require("./routes/admin");
const taskRoutes = require("./routes/task");
const paymentRoutes = require("./routes/payment");
const notificationRoutes = require("./routes/notification");

// ================= TEST ROUTES =================

app.get("/", (req, res) => {
  res.status(200).send("SVES1 Backend Running 🚀");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SVES1 API Running ✅",
  });
});

// ================= MAIN ROUTES =================

app.use("/api/auth", authRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);

// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// ================= DATABASE =================

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB Error:", err.message);
  });

// ================= EXTRA =================

// Prevent mongoose strictQuery warning
mongoose.set("strictQuery", true);