import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const PurchaseRequests = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [land, setLand] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchLandAndRequests();
  }, [id, user, navigate]);

  const fetchLandAndRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch land details
      const landResponse = await axios.get(`http://localhost:5000/api/lands/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setLand(landResponse.data);

      // Fetch purchase requests
      const requestsResponse = await axios.get(`http://localhost:5000/api/lands/${id}/purchase-requests`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setRequests(requestsResponse.data);
    } catch (error) {
      console.error('Error fetching land and purchase requests:', error);
      if (error.response?.status === 403) {
        setError('You are not authorized to view purchase requests. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(error.response?.data?.message || 'Error fetching purchase requests. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.post(`http://localhost:5000/api/lands/${id}/purchase-requests/${requestId}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchLandAndRequests(); // Refresh the data
    } catch (error) {
      console.error('Error approving purchase request:', error);
      setError(error.response?.data?.message || 'Error approving purchase request. Please try again later.');
    }
  };

  const handleReject = async (requestId) => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.post(`http://localhost:5000/api/lands/${id}/purchase-requests/${requestId}/reject`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchLandAndRequests(); // Refresh the data
    } catch (error) {
      console.error('Error rejecting purchase request:', error);
      setError(error.response?.data?.message || 'Error rejecting purchase request. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!land) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Land not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Purchase Requests for {land.title}</h1>

        {requests.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No purchase requests yet
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Request from {request.buyer?.name || 'Unknown Buyer'}
                    </h3>
                    <p className="text-gray-600">
                      Requested on: {new Date(request.timestamp).toLocaleString()}
                    </p>
                    <p className="text-gray-600">
                      Status: <span className={request.status === 'pending' ? 'text-yellow-600' : request.status === 'approved' ? 'text-green-600' : 'text-red-600'}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      Buyer's Email: {request.buyer?.email || 'Not available'}
                    </p>
                    <p className="text-gray-600">
                      Buyer's Wallet: {request.buyer?.walletAddress || 'Not available'}
                    </p>
                  </div>
                  {request.status === 'pending' && (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleApprove(request._id)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request._id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseRequests; 