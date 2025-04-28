const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const landController = require('../controllers/landController');
const auth = require('../middleware/auth');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});

const fileFilter = (req, file, cb) => {
  try {
    if (file.fieldname === 'images') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed for the image field'), false);
      }
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid image format. Supported formats: JPG, PNG, GIF, WEBP'), false);
      }
      cb(null, true);
    }
    else if (file.fieldname === 'document') {
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Only PDF documents are allowed'), false);
      }
      cb(null, true);
    }
    else {
      cb(new Error('Invalid field name'), false);
    }
  } catch (error) {
    cb(error, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 6 // 5 images + 1 document
  },
  fileFilter: fileFilter
});

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum size is 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Maximum 5 images allowed'
      });
    }
    return res.status(400).json({
      message: 'File upload error: ' + err.message
    });
  }
  if (err) {
    return res.status(400).json({
      message: err.message || 'Error processing file upload'
    });
  }
  next();
};

// Register new land with file uploads
router.post('/register', 
  auth, 
  (req, res, next) => {
    upload.fields([
      { name: 'images', maxCount: 5 },
      { name: 'document', maxCount: 1 }
    ])(req, res, (err) => {
      if (err) {
        handleMulterError(err, req, res, next);
      } else {
        // Validate required files
        if (!req.files || !req.files.images || !req.files.document) {
          return res.status(400).json({
            message: 'Both images and document are required',
            missing: {
              images: !req.files?.images,
              document: !req.files?.document
            }
          });
        }
        next();
      }
    });
  },
  landController.registerLand
);

// Get all verified lands
router.get('/', landController.getLands);

// Get all available lands (must be before /:id route)
router.get('/available', landController.getAvailableLands);

// Get lands by owner
router.get('/owner/lands', auth, landController.getLandsByOwner);

// Get land images
router.get('/:id/images/:index', auth, landController.getLandImage);

// Get land document
router.get('/:id/document', auth, landController.getLandDocument);

// Get land by ID (must be after specific routes)
router.get('/:id', landController.getLandById);

// Get purchase requests for a land (must be before /:id route)
router.get('/:id/purchase-requests', auth, landController.getPurchaseRequests);

// Request purchase of land
router.post('/:id/purchase', auth, landController.requestPurchase);

// Approve purchase request
router.post('/:id/purchase-requests/:requestId/approve', auth, landController.approvePurchase);

// Complete purchase with payment
router.post('/:id/purchase-requests/:requestId/complete', auth, landController.completePurchase);

// Reject purchase request
router.post('/:id/purchase-requests/:requestId/reject', auth, landController.rejectPurchase);

module.exports = router; 