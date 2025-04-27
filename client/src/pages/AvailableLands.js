import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AvailableLands = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchaseStatus, setPurchaseStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price-asc', 'price-desc'

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAvailableLands();
  }, [user, navigate]);

  const fetchAvailableLands = async () => {
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
        setLands(response.data);
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
      await axios.post(
        `http://localhost:5000/api/lands/${landId}/purchase`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setPurchaseStatus(prev => ({
        ...prev,
        [landId]: 'Request sent successfully!'
      }));
      // Refresh the lands list after a short delay
      setTimeout(fetchAvailableLands, 2000);
    } catch (error) {
      console.error('Purchase request error:', error);
      setPurchaseStatus(prev => ({
        ...prev,
        [landId]: error.response?.data?.message || 'Error sending purchase request'
      }));
    }
  };

  const filteredAndSortedLands = lands
    .filter(land => 
      land.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      land.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      land.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
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
      <h1 className="text-3xl font-bold mb-8 text-center">Available Lands</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search and Sort Controls */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by title, description, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-full md:w-48">
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

      {filteredAndSortedLands.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          {searchTerm ? 'No lands match your search criteria' : 'No lands available at the moment'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <span className="font-semibold">Listed:</span>{' '}
                    {new Date(land.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {purchaseStatus[land._id] && (
                  <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">
                    {purchaseStatus[land._id]}
                  </div>
                )}

                <button
                  onClick={() => handlePurchaseRequest(land._id)}
                  disabled={purchaseStatus[land._id]}
                  className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors ${
                    purchaseStatus[land._id] ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {purchaseStatus[land._id] ? 'Request Sent' : 'Request Purchase'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableLands;