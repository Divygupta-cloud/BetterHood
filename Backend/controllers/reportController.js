const Report = require("../models/Report");

// Create a new report
exports.createReport = async (req, res, next) => {
  try {
    const { title, description, location, image } = req.body;

    // Validate required fields
    if (!title || !location) {
      return res.status(400).json({
        message: "Title and location are required"
      });
    }

    const newReport = new Report({
      title,
      description,
      location,
      image,
      createdBy: req.user.uid,
    });

    await newReport.save();
    res.status(201).json(newReport);
  } catch (error) {
    next(error);
  }
};

// Get all reports (for authorities)
exports.getReports = async (req, res, next) => {
  try {
    const { status, location } = req.query;
    let query = {};

    // Apply filters if provided
    if (status) query.status = status;
    if (location) query.location = new RegExp(location, 'i');

    const reports = await Report.find(query)
      .sort({ createdAt: -1 });
    
    res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
};

// Get reports for a specific user
exports.getMyReports = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = { createdBy: req.user.uid };

    if (status) query.status = status;

    const reports = await Report.find(query)
      .sort({ createdAt: -1 });
    
    res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
};

// Get a single report by ID
exports.getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Check if user has access to this report
    if (req.userRole !== 'authority' && report.createdBy !== req.user.uid) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(report);
  } catch (error) {
    next(error);
  }
};

// Update a report
exports.updateReport = async (req, res, next) => {
  try {
    const { status, resolvedImage } = req.body;

    // Validate status
    if (status && !['pending', 'resolved'].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value"
      });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Only allow updating to resolved if resolvedImage is provided
    if (status === 'resolved' && !resolvedImage && !report.resolvedImage) {
      return res.status(400).json({
        message: "Resolution image is required to mark as resolved"
      });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      { status, resolvedImage, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedReport);
  } catch (error) {
    next(error);
  }
};

// Get report statistics
exports.getReportStats = async (req, res, next) => {
  try {
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });
    
    // Calculate resolution rate
    const resolutionRate = totalReports > 0 
      ? (resolvedReports / totalReports) * 100 
      : 0;

    // Get reports by location
    const locationStats = await Report.aggregate([
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          location: '$_id',
          count: 1,
          resolved: 1,
          pending: 1,
          resolutionRate: {
            $multiply: [
              { $divide: ['$resolved', '$count'] },
              100
            ]
          },
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Calculate average resolution time
    const resolvedReportsData = await Report.find(
      { status: 'resolved' },
      { createdAt: 1, updatedAt: 1 }
    );

    let totalResolutionTime = 0;
    resolvedReportsData.forEach(report => {
      const resolutionTime = report.updatedAt - report.createdAt;
      totalResolutionTime += resolutionTime;
    });

    const avgResolutionTime = resolvedReportsData.length > 0
      ? totalResolutionTime / (resolvedReportsData.length * 1000 * 60 * 60 * 24) // Convert to days
      : 0;

    // Get reports trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const reportsTrend = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      totalReports,
      pendingReports,
      resolvedReports,
      resolutionRate,
      avgResolutionTime,
      locationStats,
      reportsTrend
    });
  } catch (error) {
    next(error);
  }
};
