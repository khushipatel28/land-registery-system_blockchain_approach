const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { ethers } = require('ethers');
const LandRegistry = require(path.join(__dirname, '../blockchain/artifacts/contracts/LandRegistry.sol/LandRegistry.json'));
const multer = require('multer');
const landRoutes = require('./routes/land');
const userRoutes = require('./routes/user');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow frontend to access
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Verify blockchain connection
async function verifyBlockchainConnection() {
    try {
        if (!process.env.ETHEREUM_RPC_URL) {
            throw new Error('ETHEREUM_RPC_URL is not defined in environment variables');
        }
        if (!process.env.SMART_CONTRACT_ADDRESS) {
            throw new Error('SMART_CONTRACT_ADDRESS is not defined in environment variables');
        }
        if (!process.env.PRIVATE_KEY) {
            throw new Error('PRIVATE_KEY is not defined in environment variables');
        }

        const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
        const network = await provider.getNetwork();
        console.log('Connected to Ethereum network:', network);

        const contract = new ethers.Contract(
            process.env.SMART_CONTRACT_ADDRESS,
            LandRegistry.abi,
            provider
        );
        console.log('Smart contract initialized at:', process.env.SMART_CONTRACT_ADDRESS);

        const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const balance = await signer.getBalance();
        console.log('Signer balance:', ethers.utils.formatEther(balance), 'ETH');

        if (balance.eq(0)) {
            console.warn('Warning: Signer has no ETH balance');
        }

        return true;
    } catch (error) {
        console.error('Blockchain connection error:', error);
        return false;
    }
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log('Connected to MongoDB');
    
    // Verify blockchain connection
    const blockchainConnected = await verifyBlockchainConnection();
    if (!blockchainConnected) {
        console.error('Failed to connect to blockchain. Server will start but blockchain features may not work.');
    }

    // Start server only after MongoDB connection is established
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if MongoDB connection fails
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lands', landRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        code: err.code
    });

    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation Error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            message: 'Token expired'
        });
    }

    // Handle blockchain-related errors
    if (err.message && err.message.includes('blockchain')) {
        return res.status(500).json({
            message: 'Blockchain operation failed',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Handle multer errors
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: err.message });
    }

    // Default error response
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
}); 