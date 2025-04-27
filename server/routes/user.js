const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Register new user
router.post('/register', userController.register);

// Login user
router.post('/login', userController.login);

// Get user profile
router.get('/profile', auth, userController.getProfile);

// Update user profile
router.put('/profile', auth, userController.updateProfile);

// Get user notifications
router.get('/notifications', auth, userController.getNotifications);

// Mark notification as read
router.put('/notifications/:notificationId/read', auth, userController.markNotificationAsRead);

module.exports = router; 