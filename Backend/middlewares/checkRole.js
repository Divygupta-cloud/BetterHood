const User = require('../models/User');

const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findOne({ firebaseUid: req.user.uid });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (allowedRoles.includes(user.role)) {
        req.userRole = user.role; // Attach role to request
        next();
      } else {
        res.status(403).json({ message: 'Access denied' });
      }
    } catch (error) {
      next(error);
    }
  };
};

module.exports = checkRole; 