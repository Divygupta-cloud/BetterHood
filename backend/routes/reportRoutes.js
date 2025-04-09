const express = require('express');
const router = express.Router();
const { createReport ,getReports , resolveReport} = require('../controllers/reportController');
const verifyToken = require('../middleware/authMiddleware'); // JWT auth middleware

// Submit report route (protected)
router.post('/submit', verifyToken, createReport);

// Get reports (protected)
router.get('/my-reports', verifyToken, getReports);

// Mark report as resolved (protected, only for authorities)
router.put('/resolve/:reportId', verifyToken, resolveReport);

module.exports = router;
