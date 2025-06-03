const admin = require("../config/firebase");

const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Get the user record to access custom claims
    const userRecord = await admin.auth().getUser(decodedToken.uid);
    
    // Combine decoded token with custom claims
    req.user = {
      ...decodedToken,
      role: userRecord.customClaims?.role || 'user' // Default to 'user' if no role claim
    };
    
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = verifyFirebaseToken;
