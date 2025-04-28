const Land = require('../models/Land');
const { create } = require('ipfs-http-client');
const { ethers } = require('ethers');
// const LandRegistry = require('../../blockchain/artifacts/contracts/LandRegistry.json');
const path = require('path');
const LandRegistry = require(path.join(__dirname, '../../blockchain/artifacts/contracts/LandRegistry.sol/LandRegistry.json'));
const User = require('../models/User');
const fs = require('fs');

// Initialize IPFS client
let ipfs;
try {
  // For development, use local IPFS node
  ipfs = create({ url: 'http://localhost:5001' });
} catch (error) {
  console.error('Error initializing IPFS client:', error);
  throw error;
}

// Initialize Ethereum provider
let provider;
let contract;

try {
    if (!process.env.ETHEREUM_RPC_URL) {
        console.warn('ETHEREUM_RPC_URL is not defined. Blockchain features will be disabled.');
    } else {
        provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    }
} catch (error) {
    console.error('Error initializing Ethereum provider:', error);
}

try {
    if (!process.env.SMART_CONTRACT_ADDRESS) {
        console.warn('SMART_CONTRACT_ADDRESS is not defined. Blockchain features will be disabled.');
    } else if (provider) {
        contract = new ethers.Contract(
            process.env.SMART_CONTRACT_ADDRESS,
            LandRegistry.abi,
            provider
        );
    }
} catch (error) {
    console.error('Error initializing contract:', error);
}

// Register new land
exports.registerLand = async (req, res) => {
    try {
        const { title, description, location, size, price, walletAddress } = req.body;
        const owner = req.user.userId;

        // Log the received data
        console.log('Registering new land:', {
            title,
            description,
            location,
            size,
            price,
            hasImages: !!req.files?.images,
            hasDocument: !!req.files?.document,
            files: req.files
        });

        // Validate required fields
        const missingFields = {
            title: !title,
            description: !description,
            location: !location,
            size: !size,
            price: !price,
            images: !req.files?.images,
            document: !req.files?.document,
            walletAddress: !walletAddress
        };

        const missingFieldNames = Object.entries(missingFields)
            .filter(([_, isMissing]) => isMissing)
            .map(([fieldName, _]) => fieldName);

        if (missingFieldNames.length > 0) {
            return res.status(400).json({ 
                message: 'Missing required fields: ' + missingFieldNames.join(', '),
                missingFields
            });
        }

        // Validate size and price are numbers
        if (isNaN(size) || size <= 0) {
            return res.status(400).json({ message: 'Size must be a positive number' });
        }
        if (isNaN(price) || price <= 0) {
            return res.status(400).json({ message: 'Price must be a positive number' });
        }

        // Get owner's wallet address from database
        const ownerUser = await User.findById(owner);
        if (!ownerUser) {
            return res.status(400).json({ message: 'User not found' });
        }
        if (!ownerUser.walletAddress) {
            return res.status(400).json({ message: 'User wallet address not found' });
        }

        // Verify that the wallet address matches the one used during registration
        const isWalletMatch = ownerUser.walletAddress.toLowerCase() === walletAddress.toLowerCase();
        if (!isWalletMatch) {
            return res.status(403).json({ 
                message: 'Wallet address mismatch. Please use the same wallet address that you used during registration.',
                registeredAddress: ownerUser.walletAddress,
                providedAddress: walletAddress
            });
        }

        // Get filenames from uploaded files
        const imageFilenames = req.files.images.map(file => file.filename);
        const documentFilename = req.files.document[0].filename;

        // Save land in database
        const land = new Land({
            title,
            description,
            location,
            size,
            price,
            owner,
            images: imageFilenames,
            document: documentFilename,
            isVerified: isWalletMatch // Set to true if wallet addresses match
        });

        await land.save();
        console.log('Land saved to database with ID:', land._id);

        // Return success response
        res.status(201).json({
            message: 'Land registered successfully',
            land: {
                _id: land._id,
                title: land.title,
                description: land.description,
                location: land.location,
                size: land.size,
                price: land.price,
                images: land.images,
                document: land.document,
                owner: land.owner,
                isVerified: land.isVerified
            }
        });
    } catch (error) {
        console.error('Land registration error:', error);
        // Clean up uploaded files if database save fails
        if (req.files) {
            try {
                if (req.files.images) {
                    req.files.images.forEach(file => {
                        fs.unlinkSync(file.path);
                    });
                }
                if (req.files.document) {
                    fs.unlinkSync(req.files.document[0].path);
                }
            } catch (cleanupError) {
                console.error('Error cleaning up files:', cleanupError);
            }
        }
        res.status(500).json({ 
            message: 'Error registering land',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get all verified lands
exports.getLands = async (req, res) => {
    try {
        const lands = await Land.find({ isVerified: true })
            .populate('owner', 'name email walletAddress')
            .sort({ createdAt: -1 });
        res.json(lands);
    } catch (error) {
        console.error('Get lands error:', error);
        res.status(500).json({ 
            message: 'Error getting lands',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get land by ID
exports.getLandById = async (req, res) => {
    try {
        const land = await Land.findById(req.params.id)
            .populate('owner', 'name email walletAddress');
        
        if (!land) {
            return res.status(404).json({ message: 'Land not found' });
        }

        // Verify land on blockchain
        if (provider && contract && land.blockchainId) {
            try {
                const landDetails = await contract.getLandDetails(land.blockchainId);
                // Update verification status in database if it differs from blockchain
                if (land.isVerified !== landDetails.isVerified) {
                    land.isVerified = landDetails.isVerified;
                    await land.save();
                }
            } catch (error) {
                console.error('Blockchain verification error:', error);
                // If we can't verify on blockchain, keep the database status
            }
        }

        res.json(land);
    } catch (error) {
        console.error('Get land error:', error);
        res.status(500).json({ 
            message: 'Error getting land',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get lands by owner
exports.getLandsByOwner = async (req, res) => {
    try {
        const owner = req.user.userId;
        console.log('Fetching lands for owner:', owner);

        const lands = await Land.find({ owner })
            .populate('owner', 'name email walletAddress')
            .sort({ createdAt: -1 });

        console.log('Found lands:', lands.length);

        // Verify lands on blockchain
        if (provider && contract) {
            for (let land of lands) {
                if (land.blockchainId) {
                    try {
                        const landDetails = await contract.getLandDetails(land.blockchainId);
                        // Update verification status in database if it differs from blockchain
                        if (land.isVerified !== landDetails.isVerified) {
                            land.isVerified = landDetails.isVerified;
                            await land.save();
                        }
                    } catch (error) {
                        console.error('Blockchain verification error for land', land._id, ':', error);
                        // If we can't verify on blockchain, keep the database status
                        continue;
                    }
                }
            }
        }

        res.json(lands);
    } catch (error) {
        console.error('Get owner lands error:', error);
        res.status(500).json({ 
            message: 'Error getting owner lands',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get all available lands
exports.getAvailableLands = async (req, res) => {
    try {
        const lands = await Land.find({ 
            isForSale: true,
            isVerified: true
        })
        .populate('owner', 'name email walletAddress')
        .sort({ createdAt: -1 });

        console.log('Found available lands:', lands.length); // Debug log

        // Verify lands on blockchain
        if (provider && contract) {
            for (let land of lands) {
                if (land.blockchainId) {
                    try {
                        const landDetails = await contract.getLandDetails(land.blockchainId);
                        // Update verification status in database if it differs from blockchain
                        if (land.isVerified !== landDetails.isVerified) {
                            land.isVerified = landDetails.isVerified;
                            await land.save();
                        }
                    } catch (error) {
                        console.error('Blockchain verification error for land', land._id, ':', error);
                        // If we can't verify on blockchain, keep the database status
                        continue;
                    }
                }
            }
        }

        // Filter out unverified lands after blockchain check
        const verifiedLands = lands.filter(land => land.isVerified);

        console.log('Returning verified lands:', verifiedLands.length); // Debug log
        
        res.json(verifiedLands);
    } catch (error) {
        console.error('Get available lands error:', error);
        res.status(500).json({ 
            message: 'Error getting available lands',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Request purchase of land
exports.requestPurchase = async (req, res) => {
    try {
        console.log('Purchase request received for land:', req.params.id);
        console.log('User ID:', req.user.userId);

        // Validate land ID
        if (!req.params.id) {
            console.log('Land ID is missing');
            return res.status(400).json({ message: 'Land ID is required' });
        }

        // Find land
        const land = await Land.findById(req.params.id).populate('owner', 'name email walletAddress');
        if (!land) {
            console.log('Land not found');
            return res.status(404).json({ message: 'Land not found' });
        }

        console.log('Found land:', {
            id: land._id,
            title: land.title,
            owner: land.owner._id,
            isForSale: land.isForSale
        });

        if (!land.isForSale) {
            console.log('Land is not for sale');
            return res.status(400).json({ message: 'Land is not available for purchase' });
        }

        // Get buyer
        const buyer = await User.findById(req.user.userId);
        if (!buyer) {
            console.log('Buyer not found');
            return res.status(404).json({ message: 'Buyer not found' });
        }

        console.log('Found buyer:', {
            id: buyer._id,
            name: buyer.name,
            walletAddress: buyer.walletAddress
        });

        if (!buyer.walletAddress) {
            console.log('Buyer wallet address not found');
            return res.status(400).json({ message: 'Buyer wallet address not found' });
        }

        // Check for existing request
        const existingRequest = land.purchaseRequests.find(
            request => request.buyer.toString() === req.user.userId && request.status === 'pending'
        );

        if (existingRequest) {
            console.log('User already has a pending request');
            return res.status(400).json({ message: 'You already have a pending purchase request' });
        }

        // Create new request
        const newRequest = {
            buyer: req.user.userId,
            status: 'pending',
            timestamp: new Date()
        };

        // Add request to land
        if (!land.purchaseRequests) {
            land.purchaseRequests = [];
        }

        // Use $push to add the request
        const updatedLand = await Land.findByIdAndUpdate(
            land._id,
            { $push: { purchaseRequests: newRequest } },
            { new: true }
        );

        if (!updatedLand) {
            console.log('Failed to update land with purchase request');
            return res.status(500).json({ message: 'Failed to save purchase request' });
        }

        console.log('Purchase request saved to database');

        // Add notification for seller
        try {
            const seller = await User.findById(land.owner);
            if (seller) {
                if (!seller.notifications) {
                    seller.notifications = [];
                }
                seller.notifications.push({
                    type: 'purchase_approved',
                    message: `New purchase request for ${land.title}`,
                    landId: land._id
                });
                await seller.save();
                console.log('Notification added for seller');
            }
        } catch (sellerError) {
            console.error('Error adding seller notification:', sellerError);
            // Continue even if notification fails
        }

        // Add notification for buyer
        try {
            if (!buyer.notifications) {
                buyer.notifications = [];
            }
            buyer.notifications.push({
                type: 'purchase_approved',
                message: `Your purchase request for ${land.title} has been sent`,
                landId: land._id
            });
            await buyer.save();
            console.log('Notification added for buyer');
        } catch (buyerError) {
            console.error('Error adding buyer notification:', buyerError);
            // Continue even if notification fails
        }

        res.json({ 
            message: 'Purchase request sent successfully',
            request: newRequest
        });
    } catch (error) {
        console.error('Purchase request error:', error);
        res.status(500).json({ 
            message: 'Error sending purchase request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get purchase requests for a land
exports.getPurchaseRequests = async (req, res) => {
    try {
        const land = await Land.findById(req.params.id)
            .populate('purchaseRequests.buyer', 'name email walletAddress');

        if (!land) {
            return res.status(404).json({ message: 'Land not found' });
        }

        // Only land owner can view purchase requests
        if (land.owner.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(land.purchaseRequests);
    } catch (error) {
        console.error('Get purchase requests error:', error);
        res.status(500).json({ 
            message: 'Error getting purchase requests',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Approve purchase request
exports.approvePurchase = async (req, res) => {
    try {
        console.log('Approving purchase request:', {
            landId: req.params.id,
            requestId: req.params.requestId
        });

        // Find land and populate necessary fields
        const land = await Land.findById(req.params.id)
            .populate('owner', 'name email walletAddress')
            .populate('purchaseRequests.buyer', 'name email walletAddress');

        if (!land) {
            console.log('Land not found');
            return res.status(404).json({ message: 'Land not found' });
        }

        // Verify seller is the land owner
        if (land.owner._id.toString() !== req.user.userId) {
            console.log('Unauthorized: User is not the land owner');
            return res.status(403).json({ message: 'Not authorized to approve purchase requests' });
        }

        // Find the purchase request
        const purchaseRequest = land.purchaseRequests.id(req.params.requestId);
        if (!purchaseRequest) {
            console.log('Purchase request not found');
            return res.status(404).json({ message: 'Purchase request not found' });
        }

        if (purchaseRequest.status !== 'pending') {
            console.log('Purchase request is not pending');
            return res.status(400).json({ message: 'Purchase request is not pending' });
        }

        // Get buyer's details
        const buyer = await User.findById(purchaseRequest.buyer);
        if (!buyer || !buyer.walletAddress) {
            console.log('Buyer or buyer wallet address not found');
            return res.status(400).json({ message: 'Buyer wallet address not found' });
        }

        // Update the purchase request status using findByIdAndUpdate
        const updatedLand = await Land.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    'purchaseRequests.$[elem].status': 'approved'
                }
            },
            {
                arrayFilters: [{ 'elem._id': req.params.requestId }],
                new: true
            }
        );

        if (!updatedLand) {
            console.log('Failed to update purchase request status');
            return res.status(500).json({ message: 'Failed to update purchase request status' });
        }

        console.log('Purchase request approved and saved');

        // Add notification for buyer
        try {
            if (!buyer.notifications) {
                buyer.notifications = [];
            }
            buyer.notifications.push({
                type: 'purchase_approved',
                message: `Your purchase request for ${land.title} has been approved. Please complete the payment of ${land.price} ETH.`,
                landId: land._id
            });
            await buyer.save();
            console.log('Notification added for buyer');
        } catch (buyerError) {
            console.error('Error adding buyer notification:', buyerError);
            // Continue even if notification fails
        }

        // Add notification for seller
        try {
            const seller = await User.findById(land.owner);
            if (seller) {
                if (!seller.notifications) {
                    seller.notifications = [];
                }
                seller.notifications.push({
                    type: 'purchase_approved',
                    message: `You approved the purchase request for ${land.title}. Waiting for payment.`,
                    landId: land._id
                });
                await seller.save();
                console.log('Notification added for seller');
            }
        } catch (sellerError) {
            console.error('Error adding seller notification:', sellerError);
            // Continue even if notification fails
        }

        res.json({ 
            message: 'Purchase request approved successfully',
            request: {
                ...purchaseRequest.toObject(),
                status: 'approved'
            }
        });
    } catch (error) {
        console.error('Approve purchase error:', error);
        res.status(500).json({ 
            message: 'Error approving purchase request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Handle payment and transfer ownership
exports.completePurchase = async (req, res) => {
    try {
        console.log('Completing purchase:', {
            landId: req.params.id,
            requestId: req.params.requestId,
            transactionHash: req.body.transactionHash
        });

        // Find land and populate necessary fields
        const land = await Land.findById(req.params.id)
            .populate('owner', 'name email walletAddress')
            .populate('purchaseRequests.buyer', 'name email walletAddress');

        if (!land) {
            console.log('Land not found');
            return res.status(404).json({ message: 'Land not found' });
        }

        // Find the purchase request
        const purchaseRequest = land.purchaseRequests.id(req.params.requestId);
        if (!purchaseRequest) {
            console.log('Purchase request not found');
            return res.status(404).json({ message: 'Purchase request not found' });
        }

        if (purchaseRequest.status !== 'approved') {
            console.log('Purchase request is not approved');
            return res.status(400).json({ message: 'Purchase request is not approved' });
        }

        // Get buyer's details
        const buyer = await User.findById(purchaseRequest.buyer);
        if (!buyer || !buyer.walletAddress) {
            console.log('Buyer or buyer wallet address not found');
            return res.status(400).json({ message: 'Buyer wallet address not found' });
        }

        // Store the original owner before updating
        const originalOwner = land.owner;
        console.log('Original owner:', originalOwner._id);

        // Update land ownership in database first
        try {
            land.owner = purchaseRequest.buyer;
            land.isForSale = false;
            purchaseRequest.status = 'completed';
            await land.save();
            console.log('Land ownership updated in database');
        } catch (saveError) {
            console.error('Error saving land ownership:', saveError);
            return res.status(500).json({ message: 'Error updating land ownership' });
        }

        // Verify payment on blockchain if available
        if (provider && contract && land.blockchainId) {
            try {
                const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
                const contractWithSigner = contract.connect(signer);

                // Verify the transaction
                const tx = await provider.getTransaction(req.body.transactionHash);
                if (!tx) {
                    console.log('Invalid transaction hash');
                    return res.status(400).json({ message: 'Invalid transaction hash' });
                }

                // Transfer ownership on blockchain
                console.log('Transferring ownership on blockchain...');
                const transferTx = await contractWithSigner.transferLand(
                    land.blockchainId,
                    buyer.walletAddress
                );
                await transferTx.wait();
                console.log('Blockchain ownership transfer completed');
            } catch (blockchainError) {
                console.error('Blockchain error:', blockchainError);
                // Continue even if blockchain fails
                console.log('Continuing with notifications even if blockchain fails');
            }
        }

        // Add notification for buyer
        try {
            if (!buyer.notifications) {
                buyer.notifications = [];
            }
            buyer.notifications.push({
                type: 'ownership_transferred',
                message: `Payment successful! You are now the owner of ${land.title}.`,
                landId: land._id
            });
            await buyer.save();
            console.log('Notification added for buyer');
        } catch (buyerError) {
            console.error('Error adding buyer notification:', buyerError);
            // Continue even if notification fails
        }

        // Add notification for seller (original owner)
        try {
            const seller = await User.findById(originalOwner._id);
            if (seller) {
                if (!seller.notifications) {
                    seller.notifications = [];
                }
                seller.notifications.push({
                    type: 'payment_successful',
                    message: `Payment received for ${land.title}. Please transfer ownership to ${buyer.name}.`,
                    landId: land._id
                });
                await seller.save();
                console.log('Notification added for seller');
            } else {
                console.log('Seller not found for notification');
            }
        } catch (sellerError) {
            console.error('Error adding seller notification:', sellerError);
            // Continue even if notification fails
        }

        // Add a second notification for seller to confirm ownership transfer
        try {
            const seller = await User.findById(originalOwner._id);
            if (seller) {
                if (!seller.notifications) {
                    seller.notifications = [];
                }
                seller.notifications.push({
                    type: 'ownership_transferred',
                    message: `Ownership of ${land.title} has been transferred to ${buyer.name}.`,
                    landId: land._id
                });
                await seller.save();
                console.log('Ownership transfer notification added for seller');
            }
        } catch (sellerError) {
            console.error('Error adding ownership transfer notification:', sellerError);
            // Continue even if notification fails
        }

        res.json({ 
            message: 'Purchase completed successfully',
            land: {
                id: land._id,
                title: land.title,
                newOwner: buyer.name,
                oldOwner: originalOwner.name
            }
        });
    } catch (error) {
        console.error('Complete purchase error:', error);
        res.status(500).json({ 
            message: 'Error completing purchase',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Reject purchase request
exports.rejectPurchase = async (req, res) => {
    try {
        const land = await Land.findById(req.params.id);
        if (!land) {
            return res.status(404).json({ message: 'Land not found' });
        }

        // Only land owner can reject purchase requests
        if (land.owner.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const requestId = req.params.requestId;
        const purchaseRequest = land.purchaseRequests.id(requestId);

        if (!purchaseRequest) {
            return res.status(404).json({ message: 'Purchase request not found' });
        }

        if (purchaseRequest.status !== 'pending') {
            return res.status(400).json({ message: 'Purchase request is not pending' });
        }

        // Get buyer's wallet address
        const buyer = await User.findById(purchaseRequest.buyer);
        if (!buyer || !buyer.walletAddress) {
            return res.status(400).json({ message: 'Buyer wallet address not found' });
        }

        // Try to reject on blockchain if available
        if (provider && contract && land.blockchainId) {
            try {
                const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
                const contractWithSigner = contract.connect(signer);
                
                console.log('Sending rejection transaction to blockchain...');
                const tx = await contractWithSigner.rejectRequest(
                    land.blockchainId,
                    buyer.walletAddress
                );
                console.log('Transaction sent:', tx.hash);
                
                console.log('Waiting for transaction confirmation...');
                await tx.wait();
                console.log('Transaction confirmed');
            } catch (blockchainError) {
                console.error('Blockchain error:', blockchainError);
                // Continue with database update even if blockchain fails
                console.log('Continuing with database update only');
            }
        }

        // Update request status in database
        purchaseRequest.status = 'rejected';
        await land.save();
        console.log('Request status updated in database');

        res.json({ message: 'Purchase request rejected successfully' });
    } catch (error) {
        console.error('Reject purchase error:', error);
        res.status(500).json({ 
            message: 'Error rejecting purchase request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get land image
exports.getLandImage = async (req, res) => {
    try {
        const land = await Land.findById(req.params.id);
        if (!land) {
            return res.status(404).json({ message: 'Land not found' });
        }

        const index = parseInt(req.params.index);
        if (isNaN(index) || index < 0 || index >= land.images.length) {
            return res.status(400).json({ message: 'Invalid image index' });
        }

        // Construct the file path
        const imagePath = path.join(__dirname, '../../uploads', land.images[index]);
        
        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ message: 'Image file not found' });
        }

        // Send the file
        res.sendFile(imagePath);
    } catch (error) {
        console.error('Get land image error:', error);
        res.status(500).json({ 
            message: 'Error retrieving land image',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get land document
exports.getLandDocument = async (req, res) => {
    try {
        const land = await Land.findById(req.params.id);
        if (!land) {
            return res.status(404).json({ message: 'Land not found' });
        }

        if (!land.document) {
            return res.status(404).json({ message: 'No document found for this land' });
        }

        // Construct the file path
        const documentPath = path.join(__dirname, '../../uploads', land.document);
        
        // Check if file exists
        if (!fs.existsSync(documentPath)) {
            return res.status(404).json({ message: 'Document file not found' });
        }

        // Set headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="land-document.pdf"`);

        // Send the file
        res.sendFile(documentPath);
    } catch (error) {
        console.error('Get land document error:', error);
        res.status(500).json({ 
            message: 'Error retrieving land document',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}; 