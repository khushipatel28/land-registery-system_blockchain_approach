import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const PurchaseRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { landId } = useParams();
  const [land, setLand] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState({});

  useEffect(() => {
    fetchLandAndRequests();
  }, [landId]);

  const fetchLandAndRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const [landResponse, requestsResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/lands/${landId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:5000/api/lands/${landId}/purchase-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setLand(landResponse.data);
      setRequests(requestsResponse.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching land and purchase requests');
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/lands/${landId}/purchase-requests/${requestId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setStatus(prev => ({
        ...prev,
        [requestId]: 'Approved successfully!'
      }));
      // Refresh the data
      fetchLandAndRequests();
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        [requestId]: error.response?.data?.message || 'Error approving request'
      }));
    }
  };

  const handleReject = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/lands/${landId}/purchase-requests/${requestId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setStatus(prev => ({
        ...prev,
        [requestId]: 'Rejected successfully!'
      }));
      // Refresh the data
      fetchLandAndRequests();
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        [requestId]: error.response?.data?.message || 'Error rejecting request'
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!land) {
    return (
      <div className="text-center text-gray-500 mt-8">
        Land not found
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Purchase Requests</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {/* Land Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-xl font-bold mb-4">Land Details</h2>
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-semibold">Title:</span> {land.title}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Description:</span> {land.description}
            </p>
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
          </div>
        </motion.div>

        {/* Purchase Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 className="text-xl font-bold mb-4">Purchase Requests</h2>
          {requests.length === 0 ? (
            <p className="text-gray-500">No purchase requests yet</p>
          ) : (
            <div className="space-y-4">
              {requests.map(request => (
                <div
                  key={request._id}
                  className="border rounded-lg p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{request.buyer.name}</p>
                      <p className="text-gray-600">{request.buyer.email}</p>
                      <p className="text-gray-600">Wallet Address: {request.buyer.walletAddress}</p>
                      <p className="text-gray-600">Status: {request.status}</p>
                      <p className="text-gray-600">Blockchain Status: {request.blockchainStatus}</p>
                      <p className="text-gray-600">
                        Requested: {new Date(request.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {request.status === 'pending' && (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleApprove(request._id)}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                  {status[request._id] && (
                    <div className="mt-2 p-2 bg-blue-100 text-blue-700 rounded">
                      {status[request._id]}
                    </div>
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

export default PurchaseRequests; 