import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from '../components/NotificationPanel';
import { FiPlus, FiMap, FiDollarSign, FiCheckCircle, FiAlertCircle, FiArrowRight, FiBell } from 'react-icons/fi';

const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [dashboardStats, setDashboardStats] = useState({
    totalLands: 0,
    forSale: 0,
    sold: 0,
    verified: 0,
    totalValue: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchLands();
  }, [user, navigate]);

  useEffect(() => {
    if (lands.length > 0) {
      const stats = {
        totalLands: lands.length,
        forSale: lands.filter(land => land.isForSale).length,
        sold: lands.filter(land => !land.isForSale).length,
        verified: lands.filter(land => land.isVerified).length,
        totalValue: lands.reduce((total, land) => total + parseFloat(land.price || 0), 0)
      };
      setDashboardStats(stats);
    }
  }, [lands]);

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

  const getFilteredLands = () => {
    let filtered = [...lands];
    
    // Apply filters
    if (filterStatus !== 'all') {
      if (filterStatus === 'forSale') {
        filtered = filtered.filter(land => land.isForSale);
      } else if (filterStatus === 'sold') {
        filtered = filtered.filter(land => !land.isForSale);
      } else if (filterStatus === 'verified') {
        filtered = filtered.filter(land => land.isVerified);
      }
    }
    
    // Apply sorting
    if (sortBy === 'recent') {
      // Assuming lands have a createdAt field, if not we keep original order
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'priceHigh') {
      filtered.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
    } else if (sortBy === 'priceLow') {
      filtered.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
    }
    
    return filtered;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <svg className="w-24 h-24" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="#EEF2FF" strokeWidth="8" fill="none" />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke="#3B82F6"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, rotate: 0 }}
              animate={{ pathLength: 1, rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </svg>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-blue-600 font-medium"
        >
          Loading your lands...
        </motion.p>
      </div>
    );
  }

  const filteredLands = getFilteredLands();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Land Portfolio</h1>
              <p className="text-gray-600 mt-1">Manage your registered properties</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register-land')}
              className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
            >
              <FiPlus /> Register New Land
            </motion.button>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-8 shadow-sm"
            >
              <div className="flex items-center">
                <FiAlertCircle className="mr-2" size={20} />
                <p>{error}</p>
              </div>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Total Properties</p>
              <p className="text-2xl font-bold text-gray-800">{dashboardStats.totalLands}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">For Sale</p>
              <p className="text-2xl font-bold text-green-600">{dashboardStats.forSale}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Sold</p>
              <p className="text-2xl font-bold text-blue-600">{dashboardStats.sold}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Portfolio Value</p>
              <p className="text-2xl font-bold text-indigo-600">{dashboardStats.totalValue.toFixed(2)} ETH</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm"
          >
            <div>
              <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by</label>
              <select
                id="filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block p-2.5 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Lands</option>
                <option value="forSale">For Sale</option>
                <option value="sold">Sold</option>
                <option value="verified">Verified</option>
              </select>
            </div>
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block p-2.5 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="priceHigh">Price (High to Low)</option>
                <option value="priceLow">Price (Low to High)</option>
              </select>
            </div>
          </motion.div>

          {lands.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-md p-10 text-center border-2 border-dashed border-gray-200"
            >
              <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <FiMap className="text-blue-500" size={40} />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">No lands registered yet</h3>
              <p className="text-gray-500 mb-6">Start building your land portfolio by registering your first property</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register-land')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <FiPlus /> Register Your First Land
              </motion.button>
            </motion.div>
          ) : filteredLands.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-8 text-center"
            >
              <p className="text-gray-500">No lands match your current filters. Try adjusting your filter settings.</p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, staggerChildren: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <AnimatePresence>
                {filteredLands.map(land => (
                  <motion.div
                    layout
                    key={land._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all"
                  >
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800 truncate">{land.title}</h2>
                        <div className="flex space-x-1">
                          {land.isVerified && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FiCheckCircle className="mr-1" size={12} /> Verified
                            </span>
                          )}
                          {land.isForSale ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              For Sale
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Sold
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="text-gray-600 mb-4 line-clamp-2">{land.description}</p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-sm font-medium text-gray-800 truncate">{land.location}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Size</p>
                          <p className="text-sm font-medium text-gray-800">{land.size} sq ft</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Price</p>
                          <div className="flex items-center">
                            <FiDollarSign size={14} className="text-blue-500 mr-1" />
                            <p className="text-sm font-bold text-gray-800">{land.price} ETH</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Requests</p>
                          <p className="text-sm font-medium text-gray-800">
                            {land.purchaseRequests?.length || 0} pending
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-2 mt-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`/land/${land._id}`)}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-1"
                        >
                          View Details <FiArrowRight size={14} />
                        </motion.button>
                        
                        {land.purchaseRequests && land.purchaseRequests.length > 0 && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/land/${land._id}/purchase-requests`)}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-1"
                          >
                            View Requests ({land.purchaseRequests.length})
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
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
    </motion.div>
  );
};

export default SellerDashboard;