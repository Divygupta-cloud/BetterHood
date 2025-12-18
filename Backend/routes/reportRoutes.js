const express = require("express");
const router = express.Router();
const { upload, getFileStream, deleteFile, getFileInfo } = require('../utils/fileUpload');
const Report = require('../models/Report');
const verifyFirebaseToken = require("../middlewares/firebaseAuthMiddleware");
const path = require('path');

// Apply auth middleware to all routes except image retrieval
router.use((req, res, next) => {
  if (req.path.startsWith('/image/')) {
    next();
  } else {
    verifyFirebaseToken(req, res, next);
  }
});

// Get report image - no auth needed for public images
router.get('/image/:filename', async (req, res) => {
  try {
    const fileInfo = await getFileInfo(req.params.filename);
    if (!fileInfo) {
      return res.status(404).json({ message: "Image not found" });
    }

    const stream = await getFileStream(req.params.filename);
    res.setHeader('Content-Type', `image/${fileInfo.metadata.contentType}`);
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
    
    stream.pipe(res);
  } catch (error) {
    console.error('Error streaming file:', error);
    res.status(500).json({ message: "Error streaming image" });
  }
});

// Get all reports (public)
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my reports
router.get('/my-reports', async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.uid }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single report
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new report with image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('User info:', {
      uid: req.user?.uid,
      email: req.user?.email
    });

    if (!req.user || !req.user.uid) {
      throw new Error('User not authenticated');
    }

    console.log('Creating report with data:', {
      ...req.body,
      userId: req.user.uid,
      userEmail: req.user.email,
      file: req.file ? { filename: req.file.filename } : null
    });

    const reportData = {
      ...req.body,
      userId: req.user.uid,
      userEmail: req.user.email,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (req.file) {
      reportData.imageUrl = req.file.filename;
    }

    console.log('Final report data:', reportData);

    const report = new Report(reportData);
    
    // Validate the report before saving
    const validationError = report.validateSync();
    if (validationError) {
      console.error('Validation error:', validationError);
      throw new Error(`Validation failed: ${Object.values(validationError.errors).map(e => e.message).join(', ')}`);
    }

    console.log('Report validation passed');

    const savedReport = await report.save();
    console.log('Report saved successfully:', savedReport);
    res.status(201).json(savedReport);
  } catch (error) {
    console.error('Error in report creation:', error);
    console.error('Error stack:', error.stack);
    if (error.name === 'ValidationError') {
      console.error('Mongoose validation error:', error.errors);
    }
    if (req.file) {
      try {
        await deleteFile(req.file.filename);
        console.log('Cleaned up uploaded file after error');
      } catch (deleteError) {
        console.error('Error deleting file after failed report creation:', deleteError);
      }
    }
    res.status(500).json({ 
      message: 'Failed to create report',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update a report
router.patch('/:id', upload.single('image'), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // If new image uploaded, delete old one
    if (req.file && report.imageUrl) {
      await deleteFile(report.imageUrl);
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    if (req.file) {
      updateData.imageUrl = req.file.filename;
    }

    // Update status timestamps
    if (req.body.status) {
      switch (req.body.status) {
        case 'resolved':
          updateData.resolvedBy = req.user.uid;
          updateData.resolvedAt = new Date();
          break;
        case 'in-progress':
          updateData.inProgressBy = req.user.uid;
          updateData.inProgressAt = new Date();
          break;
        case 'rejected':
          updateData.rejectedBy = req.user.uid;
          updateData.rejectedAt = new Date();
          break;
      }
    }

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedReport);
  } catch (error) {
    if (req.file) {
      await deleteFile(req.file.filename);
    }
    res.status(400).json({ message: error.message });
  }
});

// Delete a report
router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user owns the report or is authority
    const isOwner = report.userId === req.user.uid;
    const isAuthority = req.user.role === 'authority';
    
    if (!isOwner && !isAuthority) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete associated image if exists
    if (report.imageUrl) {
      await deleteFile(report.imageUrl);
    }

    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
