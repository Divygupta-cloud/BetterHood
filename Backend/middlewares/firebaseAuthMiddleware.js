const admin = require("../config/firebase");

const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userRecord = await admin.auth().getUser(decodedToken.uid);
    req.user = {
      ...decodedToken,
      role: userRecord.customClaims?.role || 'user'
    };
    next();
  } catch (error) {
    console.error("❌ Firebase token verification failed:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = verifyFirebaseToken;
