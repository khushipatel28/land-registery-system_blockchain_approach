import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    size: '',
    price: ''
  });

  useEffect(() => {
    fetchLands();
  }, []);

  const fetchLands = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/lands/owner/me',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setLands(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching lands');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form data
    if (!formData.title || !formData.description || !formData.location || !formData.size || !formData.price) {
      setError('All fields are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/lands',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Clear form and refresh lands list
      setFormData({
        title: '',
        description: '',
        location: '',
        size: '',
        price: ''
      });
      await fetchLands();

      // Show success message
      setError('');
      alert('Land registered successfully!');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Error registering land';
      setError(errorMessage);
      
      // If there are missing fields, show them
      if (error.response?.data?.missing) {
        const missingFields = Object.entries(error.response.data.missing)
          .filter(([_, isMissing]) => isMissing)
          .map(([field]) => field)
          .join(', ');
        setError(`Missing required fields: ${missingFields}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Seller Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Register New Land Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-xl font-bold mb-4">Register New Land</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Size (sq ft)
              </label>
              <input
                type="number"
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Price (ETH)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Register Land
            </button>
          </form>
        </motion.div>

        {/* My Lands List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-xl font-bold mb-4">My Lands</h2>
          {lands.length === 0 ? (
            <p className="text-gray-500">No lands registered yet</p>
          ) : (
            <div className="space-y-4">
              {lands.map(land => (
                <div
                  key={land._id}
                  className="border rounded-lg p-4"
                >
                  <h3 className="font-bold">{land.title}</h3>
                  <p className="text-gray-600">{land.description}</p>
                  <div className="mt-2">
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
                      <span className="font-semibold">Blockchain ID:</span> {land.blockchainId}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Status:</span>{' '}
                      <span className={land.isForSale ? 'text-green-600' : 'text-red-600'}>
                        {land.isForSale ? 'For Sale' : 'Sold'}
                      </span>
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Purchase Requests:</span>{' '}
                      {land.purchaseRequests ? land.purchaseRequests.length : 0}
                    </p>
                  </div>
                  {land.isForSale && (
                    <button
                      onClick={() => navigate(`/purchase-requests/${land._id}`)}
                      className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      View Purchase Requests
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SellerDashboard; 