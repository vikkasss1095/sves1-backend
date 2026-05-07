const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ── Basic Auth ─────────────────────────────────────────────────────────
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role:     { type: String, enum: ['vendor', 'admin'], default: 'vendor' },

    // ── Personal Info ──────────────────────────────────────────────────────
    firstName:      { type: String, default: '' },
    lastName:       { type: String, default: '' },
    phone:          { type: String, default: '' },
    alternatePhone: { type: String, default: '' },
    dob:            { type: String, default: '' },
    gender:         { type: String, default: '' },
    profilePhotoUrl:{ type: String, default: '' },

    // ── Personal Address ───────────────────────────────────────────────────
    street:  { type: String, default: '' },
    city:    { type: String, default: '' },
    state:   { type: String, default: '' },
    pincode: { type: String, default: '' },
    country: { type: String, default: 'India' },

    // ── Company Info ───────────────────────────────────────────────────────
    companyName:     { type: String, default: '' },
    companyType:     { type: String, default: '' },
    gstNumber:       { type: String, default: '' },
    panNumber:       { type: String, default: '' },
    businessEmail:   { type: String, default: '' },
    businessPhone:   { type: String, default: '' },
    businessStreet:  { type: String, default: '' },
    businessCity:    { type: String, default: '' },
    businessState:   { type: String, default: '' },
    businessPincode: { type: String, default: '' },
    website:         { type: String, default: '' },
    yearsInBusiness: { type: String, default: '' },

    // ── Professional Info ──────────────────────────────────────────────────
    category:    { type: String, default: '' },
    subCategory: { type: String, default: '' },
    currentRole: { type: String, default: '' },
    currentOrg:  { type: String, default: '' },
    experience:  { type: String, default: '' },
    summary:     { type: String, default: '' },
    skills:      [{ type: String }],

    // ── Education ─────────────────────────────────────────────────────────
    education: [
      {
        degree:      { type: String, default: '' },
        institution: { type: String, default: '' },
        year:        { type: String, default: '' },
        grade:       { type: String, default: '' },
      },
    ],

    // ── Bank Details ───────────────────────────────────────────────────────
    accountHolder: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifsc:          { type: String, default: '' },
    bankName:      { type: String, default: '' },
    branchName:    { type: String, default: '' },
    accountType:   { type: String, default: '' },

    // ── Document URLs (Cloudinary/multer se save hogi) ─────────────────────
    resumeUrl:          { type: String, default: '' },
    companyLogoUrl:     { type: String, default: '' },
    businessLicenseUrl: { type: String, default: '' },

    // ── Admin Status ───────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String, default: '' },

    // ── Existing Fields (same rakho) ───────────────────────────────────────
    isApproved: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true },
    otp:        String,
    otpExpire:  Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);