const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['gst_certificate', 'pan_card', 'registration', 'other'],
      default: 'other',
    },
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminRemarks: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);