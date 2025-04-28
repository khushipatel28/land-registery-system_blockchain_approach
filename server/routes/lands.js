const express = require('express');
const router = express.Router();
const landController = require('../controllers/landController');
const auth = require('../middleware/auth');

// Register new land
router.post('/', auth, async (req, res, next) => {
    try {
        await landController.registerLand(req, res);
    } catch (error) {
        next(error);
    }
});

// Get all available lands (not sold)
router.get('/available', async (req, res, next) => {
    try {
        await landController.getAvailableLands(req, res);
    } catch (error) {
        next(error);
    }
});

// Get all verified lands
router.get('/', async (req, res, next) => {
    try {
        await landController.getLands(req, res);
    } catch (error) {
        next(error);
    }
});

// Get land by ID
router.get('/:id', async (req, res, next) => {
    try {
        await landController.getLandById(req, res);
    } catch (error) {
        next(error);
    }
});

// Get land images
router.get('/:id/images/:index', auth, async (req, res, next) => {
    try {
        await landController.getLandImage(req, res);
    } catch (error) {
        next(error);
    }
});

// Get land document
router.get('/:id/document', auth, async (req, res, next) => {
    try {
        await landController.getLandDocument(req, res);
    } catch (error) {
        next(error);
    }
});

// Request purchase of land
router.post('/:id/purchase', auth, async (req, res, next) => {
    try {
        await landController.requestPurchase(req, res);
    } catch (error) {
        next(error);
    }
});

// Get purchase requests for a land
router.get('/:id/purchase-requests', auth, async (req, res, next) => {
    try {
        await landController.getPurchaseRequests(req, res);
    } catch (error) {
        next(error);
    }
});

// Approve purchase request
router.post('/:id/purchase-requests/:requestId/approve', auth, async (req, res, next) => {
    try {
        await landController.approvePurchase(req, res);
    } catch (error) {
        next(error);
    }
});

// Reject purchase request
router.post('/:id/purchase-requests/:requestId/reject', auth, async (req, res, next) => {
    try {
        await landController.rejectPurchase(req, res);
    } catch (error) {
        next(error);
    }
});

// Verify land (inspector only)
router.post('/:id/verify', auth, async (req, res, next) => {
    try {
        await landController.verifyLand(req, res);
    } catch (error) {
        next(error);
    }
});

// Get lands by owner
router.get('/owner/me', auth, async (req, res, next) => {
    try {
        await landController.getLandsByOwner(req, res);
    } catch (error) {
        next(error);
    }
});

// Get unverified lands (inspector only)
router.get('/unverified', auth, async (req, res, next) => {
    try {
        await landController.getUnverifiedLands(req, res);
    } catch (error) {
        next(error);
    }
});

module.exports = router; 