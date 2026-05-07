const User = require('../models/User');
const Task = require('../models/Task');
const Rating = require('../models/Rating');
const Document = require('../models/Document');
const { cloudinary } = require('../config/cloudinary');

// ================= DASHBOARD =================
const getDashboardStats = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const totalTasks = await Task.countDocuments({ assignedTo: vendorId });
    const completedTasks = await Task.countDocuments({ assignedTo: vendorId, status: 'completed' });
    res.json({ totalTasks, completedTasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= PROFILE (Fixed) =================
const updateProfile = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // Agar data stringified JSON mein hai (multipart)
    if (req.body.data) {
      updateData = JSON.parse(req.body.data);
    }

    // Handle Multiple Files from req.files
    if (req.files) {
      if (req.files.profilePhoto?.[0]) updateData.profilePhotoUrl = req.files.profilePhoto[0].path;
      if (req.files.resume?.[0]) updateData.resumeUrl = req.files.resume[0].path;
      if (req.files.companyLogo?.[0]) updateData.companyLogoUrl = req.files.companyLogo[0].path;
      if (req.files.businessLicense?.[0]) updateData.businessLicenseUrl = req.files.businessLicense[0].path;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true
    }).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR 👉", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= UPLOAD DOCUMENT =================
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const doc = await Document.create({
      vendor: req.user._id,
      name: req.body.name,
      type: req.body.type,
      url: req.file.path,
      publicId: req.file.filename,
    });

    res.status(201).json({ message: "Document uploaded successfully", document: doc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET DOCUMENTS =================
const getDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ vendor: req.user._id });
    res.json({ documents: docs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE DOCUMENT =================
const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });
    if (doc.publicId) await cloudinary.uploader.destroy(doc.publicId);
    await doc.deleteOne();
    res.json({ message: "Document deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= MISC =================
const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    res.json({ message: 'Account deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ vendor: req.user._id });
    res.json({ ratings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try { res.json({ message: "Analytics working" }); } 
  catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getDashboardStats, updateProfile, deleteAccount, uploadDocument, getDocuments, deleteDocument, getRatings, getAnalytics };