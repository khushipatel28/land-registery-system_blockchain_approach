import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Web3 from 'web3';
import { FaEthereum, FaWallet, FaUpload, FaFileAlt, FaMapMarkerAlt, FaRulerCombined } from 'react-icons/fa';
import { motion } from 'framer-motion';

const RegisterLand = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    size: '',
    price: '',
    images: [],
    document: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]);
  const [documentName, setDocumentName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        const web3 = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setIsWalletConnected(true);
        setSuccess('Wallet connected successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error connecting wallet:', error);
        setError('Failed to connect wallet. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please install MetaMask to use this feature.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = formData.images.length + files.length;
    
    if (totalImages > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validImageTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError('Only JPG, PNG, GIF, and WEBP images are allowed');
      return;
    }

    // Process valid images
    const newImages = [...formData.images, ...files];
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));

    // Generate previews for new images
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF documents are allowed');
        return;
      }
      setFormData(prev => ({
        ...prev,
        document: file
      }));
      setDocumentName(file.name);
    }
  };

  const goToNextStep = () => {
    if (currentStep === 1) {
      if (!formData.title || !formData.description || !formData.location) {
        setError('Please fill in all required fields before proceeding');
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.size || !formData.price) {
        setError('Please fill in all required fields before proceeding');
        return;
      }
    }
    setError('');
    setCurrentStep(prev => prev + 1);
  };

  const goToPrevStep = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Check wallet connection
      if (!isWalletConnected) {
        setError('Please connect your wallet first');
        setLoading(false);
        return;
      }

      // Validate files
      if (formData.images.length === 0) {
        setError('Please upload at least one image');
        setLoading(false);
        return;
      }

      if (!formData.document) {
        setError('Please upload a PDF document');
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('size', formData.size);
      formDataToSend.append('price', formData.price);
      formData.images.forEach((image, index) => {
        formDataToSend.append('images', image);
      });
      formDataToSend.append('document', formData.document);
      formDataToSend.append('walletAddress', walletAddress);

      const response = await axios.post('http://localhost:5000/api/lands/register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setSuccess('Land registered successfully! Redirecting to dashboard...');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (error) {
      console.error('Error registering land:', error);
      if (error.response?.data?.missing) {
        const missingFields = Object.entries(error.response.data.missing)
          .filter(([_, isMissing]) => isMissing)
          .map(([field]) => field)
          .join(', ');
        setError(`Missing required fields: ${missingFields}`);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Error registering land. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-2">Register New Land</h1>
          <p className="text-center text-gray-600 mb-8">Add your property to the blockchain for secure ownership</p>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 shadow-md"
          >
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6 shadow-md"
          >
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          </motion.div>
        )}

        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaWallet className="text-white text-xl mr-2" />
                <div>
                  <h2 className="text-lg font-semibold text-white">Wallet Connection</h2>
                  {isWalletConnected ? (
                    <p className="text-sm text-blue-100">
                      Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </p>
                  ) : (
                    <p className="text-sm text-red-300">Not connected</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={connectWallet}
                disabled={isWalletConnected || loading}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  isWalletConnected
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : 'bg-white text-blue-700 hover:bg-blue-50 hover:shadow-md'
                } flex items-center`}
              >
                {isWalletConnected ? (
                  <>
                    <span className="mr-2">✓</span> Connected
                  </>
                ) : loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </span>
                ) : (
                  <>
                    <FaEthereum className="mr-2" /> Connect Wallet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    currentStep >= step ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  {step}
                </div>
                <div className="text-xs mt-2 text-gray-600">
                  {step === 1 && "Basic Info"}
                  {step === 2 && "Property Details"}
                  {step === 3 && "Documents"}
                </div>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute top-0 h-1 w-full bg-gray-200 rounded"></div>
            <div 
              className="absolute top-0 h-1 bg-blue-600 rounded transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            ></div>
          </div>
        </div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden"
        >
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Basic Information</h3>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Enter property title"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      placeholder="Describe your property in detail"
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-blue-500" />
                        Location
                      </div>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      placeholder="Enter property location"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Property Details</h3>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      <div className="flex items-center">
                        <FaRulerCombined className="mr-2 text-blue-500" />
                        Size (sq ft)
                      </div>
                    </label>
                    <input
                      type="number"
                      name="size"
                      value={formData.size}
                      onChange={handleChange}
                      required
                      min="0"
                      placeholder="Enter property size"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      <div className="flex items-center">
                        <FaEthereum className="mr-2 text-blue-500" />
                        Price (ETH)
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEthereum className="text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Upload Documents</h3>
                  
                  <div className="group mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Land Images (Max 5)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div
                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors ${
                          formData.images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => formData.images.length < 5 && document.getElementById('imageInput').click()}
                      >
                        <input
                          id="imageInput"
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          onChange={handleImageChange}
                          className="hidden"
                          multiple
                          disabled={formData.images.length >= 5}
                        />
                        <div className="text-gray-500">
                          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="mt-2 block">Add Images</span>
                        </div>
                      </div>

                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Supported formats: JPG, PNG, GIF, WEBP. Maximum 5 images.
                    </p>
                  </div>

                  <div className="group mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Land Document (PDF only)
                    </label>
                    <div
                      className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors"
                      onClick={() => document.getElementById('documentInput').click()}
                    >
                      <input
                        id="documentInput"
                        type="file"
                        accept="application/pdf"
                        onChange={handleDocumentChange}
                        className="hidden"
                      />
                      {documentName ? (
                        <div className="flex items-center justify-center space-x-2 text-green-600">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{documentName}</span>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="mt-2 block">Upload PDF Document</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Only PDF format is supported.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={goToPrevStep}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                )}
                
                {currentStep < 3 && (
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Continue
                  </button>
                )}
                
                {currentStep === 3 && (
                  <button
                    type="submit"
                    disabled={loading || !isWalletConnected}
                    className={`ml-auto px-6 py-2 rounded-lg transition-colors ${
                      loading || !isWalletConnected 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Registering...
                      </span>
                    ) : (
                      'Register Land'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </motion.div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Need help? <a href="#" className="text-blue-600 hover:underline">Contact support</a></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterLand;