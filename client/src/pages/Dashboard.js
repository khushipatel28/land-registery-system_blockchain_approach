import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserLands();
  }, []);

  const fetchUserLands = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/lands/owner/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLands(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching your lands');
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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-4">
          Welcome, {user.name}
        </h1>
        <p className="text-center text-gray-600">
          {user.role === 'seller' ? 'Manage your land listings' : 'View your purchased lands'}
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {user.role === 'seller' && (
        <div className="text-center mb-8">
          <Link
            to="/register-land"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Register New Land
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lands.map((land) => (
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
                <h3 className="font-bold text-gray-700">Land Details</h3>
                <p className="text-gray-600">Location: {land.location}</p>
                <p className="text-gray-600">Price: {land.price} ETH</p>
                <p className="text-gray-600">
                  Status: {land.isVerified ? 'Verified' : 'Pending Verification'}
                </p>
              </div>

              <Link
                to={`/land/${land._id}`}
                className="block w-full text-center bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                View Details
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {lands.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          {user.role === 'seller'
            ? 'You haven\'t registered any lands yet'
            : 'You haven\'t purchased any lands yet'}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 