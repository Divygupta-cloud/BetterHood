const Report = require('../models/Reports');

// Create new report
const createReport = async (req, res) => {
  try {
    const { title, description, location, imageUrl, status } = req.body;

    const newReport = new Report({
      title,
      description,
      location,
      imageUrl: imageUrl || '', // in future, this will come from uploaded file
      status: 'pending',
      submittedBy: req.user.userId,

    });

    await newReport.save();
    res.status(201).json({ message: 'Report submitted successfully', report: newReport });

    } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get reports based on user role
const getReports = async (req, res) => {
  try {
    const userRole = req.user.role;

    let reports;
    if (userRole === 'authority') {
      // Authority can see all reports but not user details
      reports = await Report.find({}, '-submittedBy').sort({ createdAt: -1 });
    } else {
      // Normal user sees only their own reports
      reports = await Report.find({ submittedBy: req.user.userId }).sort({ createdAt: -1 });
    }

    res.status(200).json({ reports });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const resolveReport = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== 'authority') {
      return res.status(403).json({ message: 'Forbidden: Only authorities can resolve reports.' });
    }

    const { reportId } = req.params;
    const { resolvedImageUrl } = req.body;

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    report.status = 'resolved';
    report.resolvedImageUrl = resolvedImageUrl;
    await report.save();

    
    res.status(200).json({ message: 'Report marked as resolved', report });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = { createReport, getReports, resolveReport };
