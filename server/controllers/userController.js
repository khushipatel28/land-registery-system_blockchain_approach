const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new user
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, walletAddress } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check if wallet address is already registered
        user = await User.findOne({ walletAddress });
        if (user) {
            return res.status(400).json({ message: 'Wallet address already registered' });
        }

        // Create new user
        user = new User({
            name,
            email,
            password,
            role,
            walletAddress
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Create JWT token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ 
            message: 'Error registering user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Error logging in',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            message: 'Error getting profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, walletAddress } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (walletAddress) user.walletAddress = walletAddress;

        await user.save();
        res.json(user);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            message: 'Error updating profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get user notifications
exports.getNotifications = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select('notifications')
            .populate('notifications.landId', 'title');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Sort notifications by timestamp (newest first)
        const sortedNotifications = user.notifications.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        res.json(sortedNotifications);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ 
            message: 'Error getting notifications',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const notification = user.notifications.id(req.params.notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.isRead = true;
        await user.save();

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({ 
            message: 'Error marking notification as read',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}; 