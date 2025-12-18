const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const User = require('../models/User');
const verifyFirebaseToken = require('../middlewares/firebaseAuthMiddleware'); // fixed path
const AUTHORITY_PIN = '123456';

// POST /api/admin/setup-authority
router.post('/setup-authority', verifyFirebaseToken, async (req, res) => {
  console.log('📩 Incoming /setup-authority request');
  const user = req.user;
  const { pin } = req.body;
  if (!user || !user.uid) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  if (!pin || pin !== AUTHORITY_PIN) {
    return res.status(403).json({ message: 'Invalid authority PIN' });
  }
  try {
    await admin.auth().setCustomUserClaims(user.uid, { role: 'authority' });
    await User.findOneAndUpdate({ firebaseUid: user.uid }, { role: 'authority' }, { new: true });
    res.json({
      message: 'Authority role set successfully',
      uid: user.uid,
      role: 'authority'
    });
  } catch (error) {
    console.error('Error setting authority role:', error);
    res.status(500).json({
      message: 'Failed to set authority role',
      error: error.message
    });
  }
});

// POST /api/admin/set-role
router.post('/set-role', verifyFirebaseToken, async (req, res) => {
  const user = req.user;
  const { role } = req.body;
  if (!user || !user.uid) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  if (!role) {
    return res.status(400).json({ message: 'Role is required' });
  }
  try {
    await admin.auth().setCustomUserClaims(user.uid, { role });
    await User.findOneAndUpdate({ firebaseUid: user.uid }, { role }, { new: true });
    res.json({ message: 'User role updated', role });
  } catch (error) {
    console.error('Error setting role:', error);
    res.status(500).json({
      message: 'Failed to set user role',
      error: error.message
    });
  }
});

// GET /api/admin/my-role
router.get('/my-role', verifyFirebaseToken, async (req, res) => {
  const user = req.user;
  if (!user || !user.uid) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  try {
    const dbUser = await User.findOne({ firebaseUid: user.uid });
    const role = dbUser?.role || 'user';
    res.json({ role });
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ message: 'Failed to fetch user role' });
  }
});

module.exports = router;
