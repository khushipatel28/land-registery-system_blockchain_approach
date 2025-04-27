const Land = require('../models/Land');
const { create } = require('ipfs-http-client');
const { ethers } = require('ethers');
// const LandRegistry = require('../../blockchain/artifacts/contracts/LandRegistry.json');
const path = require('path');
const LandRegistry = require(path.join(__dirname, '../../blockchain/artifacts/contracts/LandRegistry.sol/LandRegistry.json'));
const User = require('../models/User');

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
        const { title, description, location, size, price, document } = req.body;
        const owner = req.user.userId;

        // Validate required fields
        if (!title || !description || !location || !size || !price || !document) {
            return res.status(400).json({ 
                message: 'All fields are required',
                missing: {
                    title: !title,
                    description: !description,
                    location: !location,
                    size: !size,
                    price: !price,
                    document: !document
                }
            });
        }

        // Validate size and price are numbers
        if (isNaN(size) || size <= 0) {
            return res.status(400).json({ message: 'Size must be a positive number' });
        }
        if (isNaN(price) || price <= 0) {
            return res.status(400).json({ message: 'Price must be a positive number' });
        }

        // Get owner's wallet address
        const ownerUser = await User.findById(owner);
        if (!ownerUser) {
            return res.status(400).json({ message: 'User not found' });
        }
        if (!ownerUser.walletAddress) {
            return res.status(400).json({ message: 'User wallet address not found' });
        }

        console.log('Registering land with details:', {
            title,
            description,
            location,
            size,
            price,
            owner: ownerUser.walletAddress
        });

        let blockchainId = null;

        // Try to register on blockchain if available
        if (provider && contract) {
            try {
                // Check if contract is properly initialized
                const contractAddress = await contract.address;
                console.log('Contract address:', contractAddress);

                // Check if contract has the required function
                const contractFunctions = Object.keys(contract.functions);
                console.log('Available contract functions:', contractFunctions);

                if (!contractFunctions.includes('registerLand')) {
                    throw new Error('registerLand function not found in contract');
                }

                const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
                const contractWithSigner = contract.connect(signer);
                
                // Generate document hash
                const documentHash = Buffer.from(document).toString('base64').slice(0, 32);
                
                console.log('Sending transaction to blockchain...');
                console.log('Transaction parameters:', {
                    location,
                    size,
                    price: ethers.utils.parseEther(price.toString()),
                    documentHash
                });

                const tx = await contractWithSigner.registerLand(
                    location,
                    size,
                    ethers.utils.parseEther(price.toString()),
                    documentHash
                );
                console.log('Transaction sent:', tx.hash);
                
                console.log('Waiting for transaction confirmation...');
                const receipt = await tx.wait();
                console.log('Transaction confirmed:', receipt);

                // Get the land ID from the blockchain
                const landCount = await contractWithSigner.landCount();
                blockchainId = landCount.toNumber();
                console.log('Land registered on blockchain with ID:', blockchainId);
            } catch (blockchainError) {
                console.error('Blockchain error:', blockchainError);
                // Continue with database registration even if blockchain fails
                console.log('Continuing with database registration only');
            }
        } else {
            console.log('Blockchain not available, proceeding with database registration only');
        }

        // Generate a simple document hash from the document data
        const documentHash = Buffer.from(document).toString('base64').slice(0, 32);

        // Save land in database
        const land = new Land({
            title,
            description,
            location,
            size,
            price,
            owner,
            blockchainId: blockchainId || 0, // Use 0 if blockchain registration failed
            isVerified: true, // Set to true since we're using blockchain verification
            documentHash // Add the document hash
        });

        await land.save();
        console.log('Land saved to database');

        res.status(201).json(land);
    } catch (error) {
        console.error('Land registration error:', error);
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
        const lands = await Land.find({ owner: req.user.userId })
            .sort({ createdAt: -1 });
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

        console.log('Found', verifiedLands.length, 'verified lands');
        
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
        const land = await Land.findById(req.params.id);
        if (!land) {
            return res.status(404).json({ message: 'Land not found' });
        }

        if (!land.isForSale) {
            return res.status(400).json({ message: 'Land is not available for purchase' });
        }

        // Get buyer's wallet address
        const buyer = await User.findById(req.user.userId);
        if (!buyer || !buyer.walletAddress) {
            return res.status(400).json({ message: 'Buyer wallet address not found' });
        }

        // Check if user already has a pending request
        const existingRequest = land.purchaseRequests.find(
            request => request.buyer.toString() === req.user.userId && request.status === 'pending'
        );

        if (existingRequest) {
            return res.status(400).json({ message: 'You already have a pending purchase request' });
        }

        // Try to send purchase request on blockchain if available
        if (provider && contract && land.blockchainId) {
            try {
                const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
                const contractWithSigner = contract.connect(signer);
                
                console.log('Sending purchase request to blockchain...');
                const tx = await contractWithSigner.sendPurchaseRequest(land.blockchainId);
                console.log('Transaction sent:', tx.hash);
                
                console.log('Waiting for transaction confirmation...');
                await tx.wait();
                console.log('Transaction confirmed');
            } catch (blockchainError) {
                console.error('Blockchain error:', blockchainError);
                // Continue with database registration even if blockchain fails
                console.log('Continuing with database registration only');
            }
        }

        // Add purchase request to database
        land.purchaseRequests.push({
            buyer: req.user.userId,
            status: 'pending',
            timestamp: new Date()
        });

        await land.save();
        console.log('Purchase request saved to database');

        res.json({ message: 'Purchase request sent successfully' });
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
        const land = await Land.findById(req.params.id);
        if (!land) {
            return res.status(404).json({ message: 'Land not found' });
        }

        // Only land owner can approve purchase requests
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

        // Try to approve on blockchain if available
        if (provider && contract && land.blockchainId) {
            try {
                const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
                const contractWithSigner = contract.connect(signer);
                
                console.log('Sending approval transaction to blockchain...');
                const tx = await contractWithSigner.approveRequest(
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

        // Update land ownership in database
        land.owner = purchaseRequest.buyer;
        land.isForSale = false;
        purchaseRequest.status = 'approved';
        await land.save();
        console.log('Land ownership updated in database');

        res.json({ message: 'Land ownership transferred successfully' });
    } catch (error) {
        console.error('Approve purchase error:', error);
        res.status(500).json({ 
            message: 'Error approving purchase request',
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