const User = require('../models/User');
const Task = require('../models/Task');
const Rating = require('../models/Rating');
const Document = require('../models/Document');
const { cloudinary } = require('../config/cloudinary');

// ================= DASHBOARD =================
const getDashboardStats = async (req, res) => {
  try {

    const vendorId = req.user._id;

    const totalTasks = await Task.countDocuments({
      assignedTo: vendorId,
    });

    const completedTasks = await Task.countDocuments({
      assignedTo: vendorId,
      status: 'completed',
    });

    res.json({
      totalTasks,
      completedTasks,
    });

  } catch (error) {

    console.error("DASHBOARD ERROR 👉", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= CREATE PROFILE =================
const createVendorProfile = async (req, res) => {
  try {

    let data = {};

    // SAFE PARSE
    if (req.body.data) {
      data = JSON.parse(req.body.data);
    } else {
      data = req.body;
    }

    console.log("PROFILE DATA 👉", data);

    // UPDATE USER
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        // PERSONAL
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phone: data.phone || "",
        email: data.email || "",

        city: data.city || "",
        state: data.state || "",

        // COMPANY
        companyName: data.companyName || "",
        companyType: data.companyType || "",
        gstNumber: data.gstNumber || "",
        panNumber: data.panNumber || "",
        website: data.website || "",

        // PROFESSIONAL
        category: data.category || "",
        subCategory: data.subCategory || "",
        currentRole: data.currentRole || "",
        experience: data.experience || "",
        skills: data.skills || [],

        // EDUCATION
        education: data.education || [],

        // BANK
        accountHolder: data.accountHolder || "",
        accountNumber: data.accountNumber || "",
        ifsc: data.ifsc || "",
        bankName: data.bankName || "",
        branchName: data.branchName || "",
      },
      {
        new: true,
        runValidators: false,
      }
    );

    res.status(201).json({
      success: true,
      message: "Vendor profile created successfully",
      vendor: updatedUser,
    });

  } catch (error) {

    console.log("CREATE PROFILE ERROR 👉", error);

    res.status(500).json({
      message: error.message || "Server Error",
    });
  }
};

// ================= UPDATE PROFILE =================
const updateProfile = async (req, res) => {
  try {

    const user = await User.findByIdAndUpdate(
      req.user._id,
      req.body,
      {
        new: true,
      }
    );

    res.json({
      message: 'Profile updated',
      user,
    });

  } catch (error) {

    console.error("PROFILE ERROR 👉", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= DELETE ACCOUNT =================
const deleteAccount = async (req, res) => {
  try {

    await User.findByIdAndUpdate(
      req.user._id,
      {
        isActive: false,
      }
    );

    res.json({
      message: 'Account deactivated',
    });

  } catch (error) {

    console.error("DELETE ACCOUNT ERROR 👉", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= UPLOAD DOCUMENT =================
const uploadDocument = async (req, res) => {
  try {

    console.log("FILE 👉", req.file);

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const doc = await Document.create({
      vendor: req.user._id,
      name: req.body.name,
      type: req.body.type,
      url: req.file.path,
      publicId: req.file.filename,
    });

    res.status(201).json({
      message: "Document uploaded successfully",
      document: doc,
    });

  } catch (error) {

    console.error("UPLOAD ERROR 👉", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= GET DOCUMENTS =================
const getDocuments = async (req, res) => {
  try {

    const docs = await Document.find({
      vendor: req.user._id,
    });

    res.json({
      documents: docs,
    });

  } catch (error) {

    console.error("GET DOC ERROR 👉", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= DELETE DOCUMENT =================
const deleteDocument = async (req, res) => {
  try {

    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    await cloudinary.uploader.destroy(doc.publicId);

    await doc.deleteOne();

    res.json({
      message: "Document deleted successfully",
    });

  } catch (error) {

    console.error("DELETE DOC ERROR 👉", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= RATINGS =================
const getRatings = async (req, res) => {
  try {

    const ratings = await Rating.find({
      vendor: req.user._id,
    });

    res.json({
      ratings,
    });

  } catch (error) {

    console.error("RATINGS ERROR 👉", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= ANALYTICS =================
const getAnalytics = async (req, res) => {
  try {

    res.json({
      message: "Analytics working",
    });

  } catch (error) {

    console.error("ANALYTICS ERROR 👉", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= EXPORT =================
module.exports = {
  getDashboardStats,
  createVendorProfile,
  updateProfile,
  deleteAccount,
  uploadDocument,
  getDocuments,
  deleteDocument,
  getRatings,
  getAnalytics,
};