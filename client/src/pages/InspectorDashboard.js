import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const InspectorDashboard = () => {
  const { user } = useAuth();
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');

  useEffect(() => {
    fetchUnverifiedLands();
  }, []);

  const fetchUnverifiedLands = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/lands/unverified', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLands(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching unverified lands');
      setLoading(false);
    }
  };

  const handleVerify = async (landId) => {
    try {
      setVerificationStatus('Verifying land...');
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/lands/${landId}/verify`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setVerificationStatus('Land verified successfully!');
      fetchUnverifiedLands();
      setTimeout(() => {
        setVerificationStatus('');
      }, 2000);
    } catch (error) {
      setError('Error verifying land');
      setVerificationStatus('');
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
          Inspector Dashboard
        </h1>
        <p className="text-center text-gray-600">
          Verify land registrations
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {verificationStatus && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {verificationStatus}
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
                <h3 className="font-bold text-gray-700">Owner Details</h3>
                <p className="text-gray-600">Name: {land.owner.name}</p>
                <p className="text-gray-600">Email: {land.owner.email}</p>
                <p className="text-gray-600">Wallet: {land.owner.walletAddress}</p>
              </div>

              <div className="mb-4">
                <h3 className="font-bold text-gray-700">Land Details</h3>
                <p className="text-gray-600">Location: {land.location}</p>
                <p className="text-gray-600">Price: {land.price} ETH</p>
              </div>

              <button
                onClick={() => handleVerify(land._id)}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Verify Land
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {lands.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No unverified lands found
        </div>
      )}
    </div>
  );
};

export default InspectorDashboard; 