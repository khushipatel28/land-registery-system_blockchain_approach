const mongoose = require('mongoose');

const landSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    blockchainId: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isForSale: {
        type: Boolean,
        default: true
    },
    imageHash: {
        type: String,
        required: true
    },
    documentHash: {
        type: String,
        required: true
    },
    purchaseRequests: [{
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'completed'],
            default: 'pending'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Add index for faster queries
landSchema.index({ owner: 1 });
landSchema.index({ 'purchaseRequests.buyer': 1 });
landSchema.index({ isForSale: 1, isVerified: 1 });

module.exports = mongoose.model('Land', landSchema); 