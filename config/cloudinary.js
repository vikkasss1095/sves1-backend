const cloudinary = require("cloudinary").v2;

const { CloudinaryStorage } = require("multer-storage-cloudinary");

const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// STORAGE
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {

    let folder = "sves1";

    if (file.fieldname === "profilePhoto") {
      folder = "sves1/profile";
    }

    if (file.fieldname === "resume") {
      folder = "sves1/resume";
    }

    if (file.fieldname === "companyLogo") {
      folder = "sves1/company";
    }

    if (file.fieldname === "businessLicense") {
      folder = "sves1/license";
    }

    return {
      folder,
      resource_type: "auto",
    };
  },
});

// MULTER
const upload = multer({
  storage,
});

// EXPORT
module.exports = {
  cloudinary,
  upload,
};