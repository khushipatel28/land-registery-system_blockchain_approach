import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaFileAlt, FaDownload, FaMapMarkerAlt, FaRuler, FaMoneyBillWave, FaUser, FaCircle, FaCheckCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const LandDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [land, setLand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageLoadError, setImageLoadError] = useState({});
  const [imageUrls, setImageUrls] = useState([]);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [documentLoading, setDocumentLoading] = useState(false);
  const [documentError, setDocumentError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch image data for a specific index
  const fetchImageData = useCallback(async (index) => {
    try {
      setImageLoadingStates(prev => ({ ...prev, [index]: true }));
      
      const token = localStorage.getItem('token');
      const imageUrl = `http://localhost:5000/api/lands/${id}/images/${index}`;
      
      // Set the image URL directly
      setImageUrls(prev => {
        const newUrls = [...prev];
        newUrls[index] = imageUrl;
        return newUrls;
      });
      
      setImageLoadError(prev => ({...prev, [index]: false}));
      setImageLoadingStates(prev => ({ ...prev, [index]: false }));
    } catch (error) {
      console.error('Error loading image:', error);
      setImageLoadError(prev => ({...prev, [index]: true}));
      setImageLoadingStates(prev => ({ ...prev, [index]: false }));
    }
  }, [id]);

  // Clean up function to revoke object URLs
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [imageUrls]);

  const fetchLandDetails = useCallback(async () => {
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
      
      // If land has images, fetch them
      if (response.data.images && response.data.images.length > 0) {
        console.log(`Found ${response.data.images.length} images, starting fetch...`);
        // Initialize arrays for the right number of images
        setImageUrls(new Array(response.data.images.length).fill(null));
        
        // Fetch each image
        response.data.images.forEach((_, index) => {
          fetchImageData(index);
        });
      }
    } catch (error) {
      console.error('Error fetching land details:', error);
      setError(error.response?.data?.message || 'Error fetching land details. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [id, fetchImageData]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchLandDetails();
  }, [id, user, navigate, fetchLandDetails]);

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

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? (land.images.length - 1) : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === (land.images.length - 1) ? 0 : prev + 1));
  };

  const handleDownloadDocument = async () => {
    try {
      setIsLoading(true);
      setDocumentError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to download the document');
        setIsLoading(false);
        return;
      }
      
      console.log('Initiating document download for land:', id);
      
      // Create an anchor element to trigger the download
      const link = document.createElement('a');
      link.href = `http://localhost:5000/api/lands/${id}/document`;
      link.setAttribute('download', ''); // Let the server set the filename
      
      // Add authorization header through a fetch request
      const response = await fetch(link.href, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('content-disposition');
      const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 'land-document.pdf';
      
      // Convert the response to a blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Update the link with the blob URL and filename
      link.href = url;
      link.download = filename;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setIsLoading(false);
      toast.success('Document downloaded successfully');
    } catch (error) {
      setIsLoading(false);
      console.error('Download error:', error);
      
      let errorMessage = 'Error downloading document';
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Document not found';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to download this document';
        }
      } else if (error.message.includes('HTTP error')) {
        errorMessage = 'Server error while downloading document';
      } else if (!navigator.onLine) {
        errorMessage = 'Network error. Please check your connection';
      }
      
      toast.error(errorMessage);
      setDocumentError(errorMessage);
    }
  };

  const renderDocumentButton = () => {
    if (!land.document) {
      return null;
    }

    return (
      <div className="relative">
        <button
          onClick={handleDownloadDocument}
          disabled={documentLoading}
          className={`flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors bg-white px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 w-full ${
            documentLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {documentLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="flex-1">Downloading...</span>
            </>
          ) : (
            <>
              <FaFileAlt />
              <span className="flex-1">Download Document</span>
              <FaDownload />
            </>
          )}
        </button>
        {documentError && (
          <p className="text-red-500 text-sm mt-1">{documentError}</p>
        )}
      </div>
    );
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
          Loading property details...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
              <button 
                onClick={() => fetchLandDetails()} 
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!land) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500 p-8 bg-white rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Land not found</h3>
          <p className="mt-1 text-gray-500">The property you're looking for doesn't exist or has been removed.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center text-gray-700"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{land.title}</h1>
        </div>
        
        {/* Image Gallery */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
        >
          <div className="relative aspect-w-16 aspect-h-9 h-96">
            {land?.images && land.images.length > 0 ? (
              <>
                {imageLoadingStates[currentImageIndex] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                )}
                
                {imageUrls[currentImageIndex] && !imageLoadError[currentImageIndex] && (
                  <img
                    src={imageUrls[currentImageIndex]}
                    alt={`Land ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                  />
                )}
                
                {imageLoadError[currentImageIndex] && (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-gray-500">Failed to load image</p>
                      <button 
                        onClick={() => fetchImageData(currentImageIndex)}
                        className="mt-2 text-blue-500 hover:text-blue-700"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}
                
                {land.images.length > 1 && (
                  <>
                    <button
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                      onClick={handlePrevImage}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                      onClick={handleNextImage}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                      {land.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-blue-500' : 'bg-white/70 hover:bg-white'
                          }`}
                          aria-label={`View image ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-gray-500">No images available</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Thumbnail Gallery */}
          {land?.images && land.images.length > 1 && (
            <div className="p-4 border-t border-gray-100">
              <div className="flex space-x-4 overflow-x-auto py-2">
                {land.images.map((_, index) => (
                  <div key={index} className="relative flex-shrink-0">
                    {imageLoadingStates[index] && (
                      <div className="h-20 w-20 bg-gray-100 flex items-center justify-center rounded-lg">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                    
                    {imageUrls[index] && !imageLoadError[index] && (
                      <img
                        src={imageUrls[index]}
                        alt={`Thumbnail ${index + 1}`}
                        className={`h-20 w-20 object-cover rounded-lg cursor-pointer transition-all ${
                          index === currentImageIndex 
                            ? 'ring-2 ring-blue-500 scale-105' 
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    )}
                    
                    {imageLoadError[index] && (
                      <div className="h-20 w-20 bg-gray-100 flex items-center justify-center rounded-lg cursor-pointer"
                           onClick={() => fetchImageData(index)}>
                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Land Details */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{land.title}</h2>
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  land.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <FaCheckCircle className={`mr-1 ${land.isVerified ? 'text-green-500' : 'text-yellow-500'}`} />
                  {land.isVerified ? 'Verified' : 'Pending Verification'}
                </span>
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  land.isForSale ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                }`}>
                  <FaCircle className={`mr-1 ${land.isForSale ? 'text-blue-500' : 'text-red-500'}`} size={8} />
                  {land.isForSale ? 'For Sale' : 'Sold'}
                </span>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">{land.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-blue-500 mt-1 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-gray-700 font-medium">{land.location}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaRuler className="text-blue-500 mt-1 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Size</p>
                    <p className="text-gray-700 font-medium">{land.size} sq ft</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaMoneyBillWave className="text-green-500 mt-1 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-gray-700 font-bold">{land.price} ETH</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-start">
                  <FaUser className="text-blue-500 mt-1 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Owner</p>
                    <p className="text-gray-700 font-medium">{land.owner?.name || 'Unknown'}</p>
                  </div>
                </div>
                {renderDocumentButton()}
              </div>
            </div>

            {land.isForSale && land.isVerified && user._id !== land.owner._id && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6"
              >
                {requestSent ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2" />
                    <p>Purchase request sent successfully! The owner will review your request.</p>
                  </div>
                ) : (
                  <button
                    onClick={handlePurchaseRequest}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Send Purchase Request
                  </button>
                )}
              </motion.div>
            )}

            {!land.isVerified && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>This land is currently being verified. Please check back later.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative max-w-7xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {imageUrls[currentImageIndex] ? (
                <img
                  src={imageUrls[currentImageIndex]}
                  alt={`Land ${currentImageIndex + 1}`}
                  className="max-h-[80vh] max-w-full mx-auto rounded-lg"
                />
              ) : (
                <div className="w-full h-80 bg-gray-800 flex items-center justify-center rounded-lg">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
                </div>
              )}
              
              <button
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                onClick={() => setShowImageModal(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {land.images && land.images.length > 1 && (
                <>
                  <button
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-3">
                    {land.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`w-4 h-4 rounded-full transition-transform ${
                          index === currentImageIndex 
                            ? 'bg-white scale-125' 
                            : 'bg-white/40 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandDetails;