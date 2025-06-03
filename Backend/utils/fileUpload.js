const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');

// Initialize GridFS bucket
let bucket;
const initBucket = () => {
  if (!mongoose.connection || !mongoose.connection.db) {
    console.error('MongoDB connection not established');
    return null;
  }
  if (!bucket) {
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
    console.log('GridFS bucket initialized');
  }
  return bucket;
};

mongoose.connection.once('open', () => {
  initBucket();
});

// Create storage engine
const storage = new GridFsStorage({
  url: process.env.MONGO_URL,
  cache: true,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      if (!initBucket()) {
        return reject(new Error('MongoDB connection not established'));
      }

      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          console.error('Error generating filename:', err);
          return reject(err);
        }

        const match = ["image/png", "image/jpeg", "image/jpg"];
        if (match.indexOf(file.mimetype) === -1) {
          return reject(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }

        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
          metadata: {
            userId: req.user?.uid || 'anonymous',
            originalname: file.originalname,
            contentType: file.mimetype
          }
        };
        console.log('File info created:', fileInfo);
        resolve(fileInfo);
      });
    });
  }
});

// Configure multer for handling file uploads
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!initBucket()) {
      return cb(new Error('MongoDB connection not established'));
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error('Only .png, .jpg and .jpeg format allowed!');
      error.code = 'INVALID_FILE_TYPE';
      return cb(error, false);
    }
    console.log('File type validated:', file.mimetype);
    cb(null, true);
  }
});

const deleteFile = async (filename) => {
  if (!filename) return;
  
  try {
    if (!initBucket()) {
      throw new Error('MongoDB connection not established');
    }

    const files = await bucket.find({ filename }).toArray();
    if (files.length === 0) return;
    
    await Promise.all(files.map(file => bucket.delete(file._id)));
    console.log('File deleted:', filename);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

const getFileStream = async (filename) => {
  try {
    if (!initBucket()) {
      throw new Error('MongoDB connection not established');
    }

    const files = await bucket.find({ filename }).toArray();
    if (files.length === 0) {
      throw new Error('File not found');
    }
    return bucket.openDownloadStreamByName(filename);
  } catch (error) {
    console.error('Error getting file stream:', error);
    throw error;
  }
};

const getFileInfo = async (filename) => {
  try {
    if (!initBucket()) {
      throw new Error('MongoDB connection not established');
    }

    const files = await bucket.find({ filename }).toArray();
    return files[0] || null;
  } catch (error) {
    console.error('Error getting file info:', error);
    throw error;
  }
};

module.exports = {
  upload,
  deleteFile,
  getFileStream,
  getFileInfo
}; 