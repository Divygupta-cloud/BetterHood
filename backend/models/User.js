const mongoose = require('mongoose');
const { validate } = require('./Reports');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (value) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
      },
      message: 'Invalid email format'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters long'] 
  },
  role: {
    type: String,
    enum: ['user', 'authority'],
    default: 'user',
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
