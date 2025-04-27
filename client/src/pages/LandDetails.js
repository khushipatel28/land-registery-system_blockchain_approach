import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const LandDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [land, setLand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchLandDetails();
  }, [id, user, navigate]);

  const fetchLandDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/lands/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setLand(response.data);
    } catch (error) {
      console.error('Error fetching land details:', error);
      setError(error.response?.data?.message || 'Error fetching land details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseRequest = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/lands/${id}/purchase`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setRequestSent(true);
    } catch (error) {
      console.error('Error sending purchase request:', error);
      setError(error.response?.data?.message || 'Error sending purchase request. Please try again later.');
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
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{land.title}</h1>
          <p className="text-gray-600 mb-6">{land.description}</p>

          <div className="space-y-4">
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
          </div>

          {land.isForSale && land.isVerified && (
            <div className="mt-6">
              {requestSent ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  Purchase request sent successfully! The owner will review your request.
                </div>
              ) : (
                <button
                  onClick={handlePurchaseRequest}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Send Purchase Request
                </button>
              )}
            </div>
          )}

          {!land.isVerified && (
            <div className="mt-6 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              This land is currently being verified. Please check back later.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandDetails; 