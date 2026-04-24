const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    qualityScore: { type: Number, min: 0, max: 10, default: 0 },
    deliveryScore: { type: Number, min: 0, max: 10, default: 0 },
    costEfficiencyScore: { type: Number, min: 0, max: 10, default: 0 },
    complianceScore: { type: Number, min: 0, max: 10, default: 0 },
    overallScore: { type: Number, min: 0, max: 10, default: 0 },
    feedback: { type: String, default: '' },
    period: { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-calculate overall score using weighted formula
// Quality 40% + Delivery 30% + Cost 20% + Compliance 10%
ratingSchema.pre('save', function (next) {
  this.overallScore = parseFloat(
    (
      this.qualityScore * 0.4 +
      this.deliveryScore * 0.3 +
      this.costEfficiencyScore * 0.2 +
      this.complianceScore * 0.1
    ).toFixed(2)
  );
  next();
});

module.exports = mongoose.model('Rating', ratingSchema);