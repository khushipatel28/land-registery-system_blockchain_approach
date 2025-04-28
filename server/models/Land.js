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
    images: {
        type: [String], // Array of image filenames
        required: true,
        validate: [
            {
                validator: function(v) {
                    return v.length > 0; // At least one image required
                },
                message: 'At least one image is required'
            },
            {
                validator: function(v) {
                    return v.length <= 5; // Maximum 5 images
                },
                message: 'Maximum 5 images allowed'
            }
        ]
    },
    document: {
        type: String, // Document filename
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