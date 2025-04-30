import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from '../components/NotificationPanel';
import { ethers } from 'ethers';
import { FiBell } from 'react-icons/fi';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price-asc', 'price-desc'
  const [locationFilter, setLocationFilter] = useState('');
  const [pendingPayments, setPendingPayments] = useState({});
  const [paymentStatus, setPaymentStatus] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchLands();
  }, [user, navigate]);

  const fetchLands = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/lands/available', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data && Array.isArray(response.data)) {
        // Filter out unverified lands
        const verifiedLands = response.data.filter(land => land.isVerified);
        console.log('Verified lands:', verifiedLands); // Debug log
        setLands(verifiedLands);
      } else {
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching lands:', error);
      setError(error.response?.data?.message || 'Error fetching available lands. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseRequest = async (landId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/lands/${landId}/purchase`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchLands();
    } catch (error) {
      console.error('Error sending purchase request:', error);
      setError(error.response?.data?.message || 'Error sending purchase request');
    }
  };

  const handlePayment = async (landId, requestId, price, sellerWalletAddress) => {
    try {
        setPaymentStatus(prev => ({ ...prev, [landId]: 'processing' }));

        // Check if MetaMask is installed
        if (!window.ethereum) {
            throw new Error('Please install MetaMask to make payments');
        }

        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Connect to Ethereum provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        // Get the current account
        const currentAccount = await signer.getAddress();
        console.log('Current account:', currentAccount);

        // Get the current balance
        const balance = await provider.getBalance(currentAccount);
        const requiredAmount = ethers.utils.parseEther(price.toString());
        
        if (balance.lt(requiredAmount)) {
            throw new Error(`Insufficient balance. Required: ${price} ETH, Available: ${ethers.utils.formatEther(balance)} ETH`);
        }

        // Send payment
        console.log('Sending payment:', {
            to: sellerWalletAddress,
            value: ethers.utils.formatEther(requiredAmount),
            price: price
        });

        const tx = await signer.sendTransaction({
            to: sellerWalletAddress,
            value: requiredAmount
        });

        console.log('Transaction sent:', tx.hash);

        // Wait for transaction confirmation
        console.log('Waiting for transaction confirmation...');
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt);

        // Complete the purchase
        const token = localStorage.getItem('token');
        const completeResponse = await axios.post(
            `http://localhost:5000/api/lands/${landId}/purchase-requests/${requestId}/complete`,
            { 
                transactionHash: tx.hash,
                amount: price
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log('Purchase completed:', completeResponse.data);

        setPaymentStatus(prev => ({ ...prev, [landId]: 'success' }));
        fetchLands(); // Refresh the lands list
    } catch (error) {
        console.error('Payment error:', error);
        setPaymentStatus(prev => ({ ...prev, [landId]: 'error' }));
        
        // Show user-friendly error message
        if (error.code === 4001) {
            setError('Transaction was rejected by user');
        } else if (error.code === -32603) {
            setError('Transaction failed. Please check your balance and try again.');
        } else {
            setError(error.message || 'Error processing payment. Please try again.');
        }
    }
  };

  const filteredAndSortedLands = lands
    .filter(land => {
      const matchesSearch = 
        land.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        land.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        land.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLocation = locationFilter 
        ? land.location.toLowerCase().includes(locationFilter.toLowerCase())
        : true;

      return matchesSearch && matchesLocation;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-8 text-center">Welcome to Land Registry</h1>
          <h2 className="text-xl mb-8 text-center text-gray-600">Browse verified lands available for purchase</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Search and Filter Controls */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-2">
              <input
                type="text"
                placeholder="Search by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Location Filter */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {filteredAndSortedLands.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              {searchTerm || locationFilter ? 'No lands match your search criteria' : 'No verified lands available at the moment'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAndSortedLands.map(land => (
                <motion.div
                  key={land._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-2">{land.title}</h2>
                    <p className="text-gray-600 mb-4">{land.description}</p>
                    <div className="mb-4">
                      <p className="text-gray-700">
                        <span className="font-semibold">Location:</span> {land.location}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Size:</span> {land.size} sq ft
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Price:</span> {land.price} ETH
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Owner:</span> {land.owner?.name || 'Unknown'}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Status:</span>{' '}
                        <span className={land.isForSale ? 'text-green-600' : 'text-red-600'}>
                          {land.isForSale ? 'For Sale' : 'Sold'}
                        </span>
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Verification:</span>{' '}
                        <span className="text-green-600">Verified</span>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/land/${land._id}`)}
                        className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        View Details
                      </button>

                    {land.purchaseRequests?.some(req => 
                      req.buyer === user._id && req.status === 'approved'
                    ) ? (
                      <button
                        onClick={() => handlePayment(
                          land._id,
                          land.purchaseRequests.find(req => req.buyer === user._id)._id,
                          land.price,
                          land.owner.walletAddress
                        )}
                        disabled={paymentStatus[land._id] === 'processing'}
                        className={`flex-1 ${
                          paymentStatus[land._id] === 'processing'
                            ? 'bg-gray-400'
                            : paymentStatus[land._id] === 'success'
                            ? 'bg-green-500'
                            : 'bg-blue-500'
                        } text-white py-2 rounded-lg hover:bg-blue-600 transition-colors`}
                      >
                        {paymentStatus[land._id] === 'processing'
                          ? 'Processing Payment...'
                          : paymentStatus[land._id] === 'success'
                          ? 'Payment Successful!'
                          : 'Complete Payment'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchaseRequest(land._id)}
                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Request Purchase
                      </button>
                    )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="md:col-span-1"
        >
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 pl-2 border-l-4 border-blue-500 flex items-center">
                <FiBell className="mr-2 text-blue-500" /> Notifications
              </h2>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                New
              </span>
            </div>
            
            {/* Scrollable Notification Panel */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <NotificationPanel />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BuyerDashboard; 