const User = require('../models/User');
const Task = require('../models/Task');
const Rating = require('../models/Rating');
const Document = require('../models/Document');
const { cloudinary } = require('../config/cloudinary');

// --- Helper: Data Parser ---
const parseFormData = (req) => {
  let data = {};
  try {
    if (req.body.data) {
      data = JSON.parse(req.body.data);
    } else {
      data = req.body;
    }
  } catch (e) {
    console.error("JSON Parsing Error:", e);
  }
  
  // File URLs mapping
  if (req.files) {
    if (req.files.profilePhoto) data.profilePhotoUrl = req.files.profilePhoto[0].path;
    if (req.files.resume) data.resumeUrl = req.files.resume[0].path;
    if (req.files.companyLogo) data.companyLogoUrl = req.files.companyLogo[0].path;
    if (req.files.businessLicense) data.businessLicenseUrl = req.files.businessLicense[0].path;
  }
  return data;
};

// ================= REGISTRATION (New) =================
const registerVendor = async (req, res) => {
  try {
    const data = parseFormData(req);
    
    if (!data.email || !data.password) {
      return res.status(400).json({ message: "Email and Password are required" });
    }

    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Name generate karein agar nahi hai
    data.name = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email;
    data.role = 'vendor';
    data.status = 'pending';

    const user = await User.create(data);
    res.status(201).json({ message: "Registration successful", user });
  } catch (error) {
    console.error("REGISTRATION ERROR 👉", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE PROFILE =================
const updateProfile = async (req, res) => {
  try {
    const data = parseFormData(req);
    
    const user = await User.findByIdAndUpdate(req.user._id, data, {
      new: true,
      runValidators: true
    }).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR 👉", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= OTHER STATS =================
const getDashboardStats = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({ assignedTo: req.user._id });
    const completedTasks = await Task.countDocuments({ assignedTo: req.user._id, status: 'completed' });
    res.json({ totalTasks, completedTasks });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file" });
    const doc = await Document.create({
      vendor: req.user._id,
      name: req.body.name,
      type: req.body.type,
      url: req.file.path,
      publicId: req.file.filename
    });
    res.status(201).json(doc);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ vendor: req.user._id });
    res.json({ documents: docs });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (doc?.publicId) await cloudinary.uploader.destroy(doc.publicId);
    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    res.json({ message: "Deactivated" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ vendor: req.user._id });
    res.json({ ratings });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAnalytics = async (req, res) => { res.json({ message: "Ok" }); };

module.exports = { registerVendor, updateProfile, getDashboardStats, uploadDocument, getDocuments, deleteDocument, deleteAccount, getRatings, getAnalytics };