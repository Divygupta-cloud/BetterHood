const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, default: 'medium' },
  contactNumber: String,
  imageUrl: String,
  userId: { type: String, required: true }, // Firebase UID
  userEmail: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  votes: { type: Number, default: 0 },
  comments: [{
    userId: String,
    userEmail: String,
    text: String,
    createdAt: Date
  }],
  resolvedImage: String,
  resolvedAt: Date,
  resolvedBy: String, // Authority Firebase UID who resolved the issue
  resolutionNotes: String
}, { 
  timestamps: true // This will add createdAt and updatedAt fields
});

// Add index for better query performance
reportSchema.index({ userId: 1, status: 1 });
reportSchema.index({ category: 1, status: 1 });
reportSchema.index({ location: 1 });

module.exports = mongoose.model("Report", reportSchema);
