const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
  },
  location: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String, 
    default: '',
  },
  resolvedImageUrl: {
    type: String, 
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
