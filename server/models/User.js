const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    walletAddress: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['buyer', 'seller'],
        required: true
    },
    notifications: [{
        type: {
            type: String,
            enum: ['purchase_approved', 'payment_successful', 'ownership_transferred'],
            required: true
        },
        message: {
            type: String,
            required: true
        },
        landId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Land'
        },
        isRead: {
            type: Boolean,
            default: false
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 