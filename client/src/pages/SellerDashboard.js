import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from '../components/NotificationPanel';

const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      const response = await axios.get('http://localhost:5000/api/lands/owner/lands', {
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
      setError(error.response?.data?.message || 'Error fetching lands. Please try again later.');
    } finally {
      setLoading(false);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Lands</h1>
            <button
              onClick={() => navigate('/register-land')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Register New Land
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {lands.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              You haven't registered any lands yet. Click the button above to register your first land.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lands.map(land => (
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
                        <span className="font-semibold">Status:</span>{' '}
                        <span className={land.isForSale ? 'text-green-600' : 'text-red-600'}>
                          {land.isForSale ? 'For Sale' : 'Sold'}
                        </span>
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Verification:</span>{' '}
                        <span className={land.isVerified ? 'text-green-600' : 'text-red-600'}>
                          {land.isVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </p>
                    </div>

                    <div className="space-x-2">
                      <button
                        onClick={() => navigate(`/land/${land._id}`)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                      >
                        View Details
                      </button>
                      {land.purchaseRequests && land.purchaseRequests.length > 0 && (
                        <button
                          onClick={() => navigate(`/land/${land._id}/purchase-requests`)}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                        >
                          View Requests ({land.purchaseRequests.length})
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-1">
          <NotificationPanel />
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard; 