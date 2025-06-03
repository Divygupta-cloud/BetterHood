const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middlewares/firebaseAuthMiddleware');
const { upload, deleteFile } = require('../utils/fileUpload');

// Apply auth middleware to all routes
router.use(verifyFirebaseToken);

// Get user profile
router.get('/profile', async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const User = require('../models/User');
    const user = await User.findOne({ firebaseUid: uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.patch('/profile', upload.single('profilePhoto'), async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const { name } = req.body;
    const User = require('../models/User');
    
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      if (req.file) {
        await deleteFile(req.file.filename);
      }
      return res.status(404).json({ message: 'User not found' });
    }

    // If new profile photo is uploaded, delete the old one
    if (req.file) {
      if (user.profilePhotoUrl) {
        try {
          await deleteFile(user.profilePhotoUrl);
        } catch (error) {
          console.error('Error deleting old profile photo:', error);
        }
      }
      user.profilePhotoUrl = req.file.filename;
    }

    if (name) {
      user.name = name;
    }
    
    user.updatedAt = new Date();
    const updatedUser = await user.save();
    
    res.status(200).json(updatedUser);
  } catch (error) {
    if (req.file) {
      await deleteFile(req.file.filename);
    }
    next(error);
  }
});

// Create new user
router.post('/', async (req, res, next) => {
  try {
    const { uid, name, email, role, createdAt } = req.body;
    
    // Verify that the requesting user is creating their own profile
    if (uid !== req.user.uid) {
      return res.status(403).json({ message: 'Forbidden: Cannot create profile for other users' });
    }

    const User = require('../models/User');
    
    // Check if user already exists
    let user = await User.findOne({ firebaseUid: uid });
    if (user) {
      return res.status(409).json({ message: 'User already exists' });
    }
    
    // Create new user
    user = new User({
      firebaseUid: uid,
      name,
      email,
      role: role || 'user',
      createdAt: createdAt || new Date()
    });
    
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// Get user by UID
router.get('/:uid', async (req, res, next) => {
  try {
    const { uid } = req.params;
    
    // Verify that the requesting user is accessing their own data
    if (uid !== req.user.uid) {
      return res.status(403).json({ message: 'Forbidden: Cannot access other user data' });
    }

    const User = require('../models/User');
    const user = await User.findOne({ firebaseUid: uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router; 