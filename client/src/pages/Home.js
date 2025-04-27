import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const Home = () => {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchLands();
  }, []);

  const fetchLands = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/lands');
      setLands(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching lands');
      setLoading(false);
    }
  };

  const filteredLands = lands.filter(land =>
    land.location.toLowerCase().includes(location.toLowerCase())
  );

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
          Welcome to Land Registry
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Browse verified lands available for purchase
        </p>

        <div className="max-w-md mx-auto mb-8">
          <input
            type="text"
            placeholder="Filter by location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLands.map((land) => (
          <motion.div
            key={land._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{land.title}</h2>
              <p className="text-gray-600 mb-4">{land.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500">{land.location}</span>
                <span className="text-blue-500 font-bold">
                  {land.price} ETH
                </span>
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

      {filteredLands.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No lands found matching your criteria
        </div>
      )}
    </div>
  );
};

export default Home; 