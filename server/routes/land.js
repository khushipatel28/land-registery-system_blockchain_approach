const express = require('express');
const router = express.Router();
const multer = require('multer');
const landController = require('../controllers/landController');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images
    if (file.fieldname === 'image') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for the image field'));
      }
    }
    // Allow documents
    else if (file.fieldname === 'document') {
      if (file.mimetype === 'application/pdf' || 
          file.mimetype === 'application/msword' || 
          file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF and Word documents are allowed for the document field'));
      }
    }
    else {
      cb(new Error('Invalid field name'));
    }
  }
});

// Register new land with file uploads
router.post('/register', auth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'document', maxCount: 1 }
]), landController.registerLand);

// Get all verified lands
router.get('/', landController.getLands);

// Get all available lands (must be before /:id route)
router.get('/available', landController.getAvailableLands);

// Get lands by owner
router.get('/owner/lands', auth, landController.getLandsByOwner);

// Get purchase requests for a land (must be before /:id route)
router.get('/:id/purchase-requests', auth, landController.getPurchaseRequests);

// Get land by ID (must be after specific routes)
router.get('/:id', landController.getLandById);

// Request purchase of land
router.post('/:id/purchase', auth, landController.requestPurchase);

// Approve purchase request
router.post('/:id/purchase-requests/:requestId/approve', auth, landController.approvePurchase);

// Complete purchase with payment
router.post('/:id/purchase-requests/:requestId/complete', auth, landController.completePurchase);

// Reject purchase request
router.post('/:id/purchase-requests/:requestId/reject', auth, landController.rejectPurchase);

module.exports = router; 