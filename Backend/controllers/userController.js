const User = require('../models/User');

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { firebaseUid, name, email, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ firebaseUid });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      firebaseUid,
      name,
      email,
      role
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

// Get user by Firebase UID
exports.getUserByFirebaseUid = async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const user = await User.findOne({ firebaseUid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const updates = req.body;
    updates.updatedAt = new Date();

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
}; 