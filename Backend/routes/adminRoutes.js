const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');
const verifyFirebaseToken = require('../middlewares/firebaseAuthMiddleware');
const User = require('../models/User');

// Authority PIN for verification (in a real app, this would be stored securely)
const AUTHORITY_PIN = '123456';

// Setup authority role with PIN verification
router.post('/setup-authority', verifyFirebaseToken, async (req, res) => {
  try {
    const { pin } = req.body;
    const user = req.user;

    if (!user || !user.uid) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!pin || pin !== AUTHORITY_PIN) {
      return res.status(403).json({ message: 'Invalid authority PIN' });
    }

    try {
      // Set authority role for the user
      await admin.auth().setCustomUserClaims(user.uid, { role: 'authority' });
      
      // Update user in MongoDB
      await User.findOneAndUpdate(
        { firebaseUid: user.uid },
        { role: 'authority' },
        { new: true }
      );
      
      res.json({ 
        message: 'Authority role set successfully',
        uid: user.uid,
        role: 'authority'
      });
    } catch (error) {
      console.error('Error setting custom claims:', error);
      res.status(500).json({ 
        message: 'Failed to set authority role',
        error: error.message 
      });
    }
  } catch (error) {
    console.error('Error in setup-authority:', error);
    res.status(500).json({ 
      message: 'Failed to process authority setup',
      error: error.message 
    });
  }
});

// Set user role
router.post('/set-role', async (req, res) => {
  try {
    // Check if the requesting user is an admin
    const requestingUser = req.user;
    if (!requestingUser || requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can set roles' });
    }

    const { uid, role } = req.body;
    if (!uid || !role) {
      return res.status(400).json({ message: 'UID and role are required' });
    }

    // Set custom claims
    await admin.auth().setCustomUserClaims(uid, { role: role });

    res.json({ message: `Role ${role} set for user ${uid}` });
  } catch (error) {
    console.error('Error setting role:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get current user's role
router.get('/my-role', verifyFirebaseToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Get fresh user data
    const userRecord = await admin.auth().getUser(user.uid);
    const customClaims = userRecord.customClaims || {};

    res.json({
      uid: user.uid,
      email: user.email,
      role: customClaims.role || 'user',
      claims: customClaims
    });
  } catch (error) {
    console.error('Error getting role:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 