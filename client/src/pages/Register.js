import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Web3 from 'web3';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer', // Default role
    walletAddress: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [emailErrors, setEmailErrors] = useState([]);
  const [activeStep, setActiveStep] = useState(1);
  const [animateDirection, setAnimateDirection] = useState('next');

  // All validation functions remain the same
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    return errors;
  };

  const validateEmail = (email) => {
    const errors = [];
    
    // Basic format check (local@domain)
    if (!email.includes('@')) {
      errors.push('Email must contain @ symbol');
      return errors;
    }

    const [local, domain] = email.split('@');

    // Local part validation
    if (!local) {
      errors.push('Email must have a local part before @');
    } else {
      if (local.length > 64) {
        errors.push('Local part cannot be longer than 64 characters');
      }
      if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) {
        errors.push('Local part contains invalid characters');
      }
      if (local.startsWith('.') || local.endsWith('.')) {
        errors.push('Local part cannot start or end with a dot');
      }
      if (local.includes('..')) {
        errors.push('Local part cannot contain consecutive dots');
      }
    }

    // Domain part validation
    if (!domain) {
      errors.push('Email must have a domain part after @');
    } else {
      if (domain.length > 255) {
        errors.push('Domain cannot be longer than 255 characters');
      }
      if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
        errors.push('Domain must be in valid format (e.g., example.com)');
      }
      if (domain.startsWith('.') || domain.endsWith('.')) {
        errors.push('Domain cannot start or end with a dot');
      }
      if (domain.includes('..')) {
        errors.push('Domain cannot contain consecutive dots');
      }
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Check password requirements on change
    if (name === 'password') {
      setPasswordErrors(validatePassword(value));
    }

    // Check email requirements on change
    if (name === 'email') {
      setEmailErrors(validateEmail(value));
    }
  };

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setFormData({
          ...formData,
          walletAddress: accounts[0]
        });
      } else {
        setError('Please install MetaMask to connect your wallet');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      setError('Error connecting to wallet. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate email format
    const emailValidationErrors = validateEmail(formData.email);
    if (emailValidationErrors.length > 0) {
      setError('Please fix the email format issues');
      setEmailErrors(emailValidationErrors);
      setLoading(false);
      return;
    }

    // Validate password strength
    const passwordValidationErrors = validatePassword(formData.password);
    if (passwordValidationErrors.length > 0) {
      setError('Please fix the password requirements');
      setPasswordErrors(passwordValidationErrors);
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate wallet address
    if (!formData.walletAddress) {
      setError('Please connect your wallet first');
      setLoading(false);
      return;
    }

    try {
      const user = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        walletAddress: formData.walletAddress
      });

      console.log('Registration successful:', user);
      
      // Redirect based on user role
      if (user.role === 'buyer') {
        navigate('/dashboard');
      } else if (user.role === 'seller') {
      navigate('/dashboard');
    } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setAnimateDirection('next');
    setTimeout(() => {
      setActiveStep(activeStep + 1);
    }, 200);
  };

  const prevStep = () => {
    setAnimateDirection('prev');
    setTimeout(() => {
      setActiveStep(activeStep - 1);
    }, 200);
  };

  const canProceedToStep2 = formData.name && formData.email && emailErrors.length === 0;
  const canProceedToStep3 = formData.password && formData.confirmPassword && 
                           formData.password === formData.confirmPassword && 
                           passwordErrors.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-800 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-purple-500 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-400 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
          
          <div className="bg-white bg-opacity-95 backdrop-filter backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-glow relative z-10">
            <div className="px-8 pt-8 pb-6">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Create Account
                </h1>
                <p className="text-gray-600 mt-2 font-medium">Join our blockchain property marketplace</p>
              </div>
              
              {/* Progress Steps */}
              <div className="flex justify-between items-center mb-8 px-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        activeStep === step 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-110' 
                          : activeStep > step 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {activeStep > step ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      ) : (
                        step
                      )}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${activeStep === step ? 'text-blue-600' : 'text-gray-500'}`}>
                      {step === 1 ? 'Profile' : step === 2 ? 'Security' : 'Wallet'}
                    </span>
                  </div>
                ))}
                <div className="absolute top-[6.8rem] left-[4.5rem] w-[6.5rem] h-0.5 bg-gray-200">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: activeStep > 1 ? '100%' : '0%' }}
                  ></div>
                </div>
                <div className="absolute top-[6.8rem] right-[4.5rem] w-[6.5rem] h-0.5 bg-gray-200">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300" 
                    style={{ width: activeStep > 2 ? '100%' : '0%' }}
                  ></div>
                </div>
              </div>
      
      {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm animate-fade-in">
                  <p className="font-medium">Please check the following:</p>
                  <p>{error}</p>
        </div>
      )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Personal Information */}
                <div className={`transition-all duration-500 ${
                  activeStep === 1 
                    ? 'opacity-100 transform translate-x-0' 
                    : 'opacity-0 absolute transform -translate-x-full'
                }`}>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Personal Information</h2>
                  
                  {/* Name Field */}
                  <div className="group mb-6">
                    <label className="block text-gray-700 font-semibold mb-2 transition-colors group-hover:text-blue-600">
                      Full Name
          </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                        placeholder="Enter your full name"
          />
                    </div>
        </div>

                  {/* Email Field */}
                  <div className="group mb-6">
                    <label className="block text-gray-700 font-semibold mb-2 transition-colors group-hover:text-blue-600">
                      Email Address
          </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                        placeholder="Enter your email"
          />
        </div>
                    {emailErrors.length > 0 && (
                      <div className="mt-2 space-y-1 animate-fade-in">
                        {emailErrors.map((error, index) => (
                          <p key={index} className="text-sm text-red-600 flex items-center">
                            <svg className="h-4 w-4 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!canProceedToStep2}
                      className={`px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 transform flex items-center ${
                        canProceedToStep2 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:translate-x-1 hover:shadow-lg' 
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      Continue
                      <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Step 2: Security */}
                <div className={`transition-all duration-500 ${
                  activeStep === 2 
                    ? 'opacity-100 transform translate-x-0' 
                    : activeStep < 2 
                      ? 'opacity-0 absolute transform translate-x-full' 
                      : 'opacity-0 absolute transform -translate-x-full'
                }`}>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Security Information</h2>
                  
                  {/* Password Field */}
                  <div className="group mb-6">
                    <label className="block text-gray-700 font-semibold mb-2 transition-colors group-hover:text-blue-600">
            Password
          </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                        placeholder="Create a strong password"
          />
        </div>

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-700">Password Strength:</span>
                          <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                passwordErrors.length === 0 ? 'bg-green-500' :
                                passwordErrors.length <= 2 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.max(0, 100 - (passwordErrors.length * 20))}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {passwordErrors.length === 0 ? 'Strong' :
                             passwordErrors.length <= 2 ? 'Medium' : 'Weak'}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {passwordErrors.length > 0 && (
                      <div className="mt-2 space-y-1 animate-fade-in">
                        {passwordErrors.map((error, index) => (
                          <p key={index} className="text-sm text-red-600 flex items-center">
                            <svg className="h-4 w-4 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="group mb-6">
                    <label className="block text-gray-700 font-semibold mb-2 transition-colors group-hover:text-blue-600">
                      Confirm Password
          </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
            onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                        placeholder="Confirm your password"
                      />
                    </div>
                    {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <svg className="h-4 w-4 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Passwords do not match
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-3 bg-gray-200 rounded-lg text-gray-700 font-medium transition-all duration-200 transform hover:bg-gray-300 hover:-translate-x-1 flex items-center"
                    >
                      <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!canProceedToStep3}
                      className={`px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 transform flex items-center ${
                        canProceedToStep3 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:translate-x-1 hover:shadow-lg' 
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      Continue
                      <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
        </div>

                {/* Step 3: Wallet and Role */}
                <div className={`transition-all duration-500 ${
                  activeStep === 3 
                    ? 'opacity-100 transform translate-x-0' 
                    : 'opacity-0 absolute transform translate-x-full'
                }`}>
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Connect Your Wallet</h2>
                  
                  {/* Wallet Address Field */}
                  <div className="group mb-6">
                    <label className="block text-gray-700 font-semibold mb-2 transition-colors group-hover:text-blue-600">
                      Ethereum Wallet
          </label>
                    <div className="flex space-x-3">
                      <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v13" />
                          </svg>
                        </div>
            <input
              type="text"
              name="walletAddress"
              value={formData.walletAddress}
              onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                          placeholder="Connect your Ethereum wallet"
              readOnly
            />
                      </div>
            <button
              type="button"
              onClick={connectWallet}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 active:scale-95 flex items-center"
            >
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
              Connect
            </button>
                    </div>
                    {formData.walletAddress && (
                      <div className="mt-2 text-sm text-green-600 flex items-center">
                        <svg className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Wallet connected successfully
                      </div>
                    )}
                  </div>

                  {/* Role Selection */}
                  <div className="group mb-6">
                    <label className="block text-gray-700 font-semibold mb-2 transition-colors group-hover:text-blue-600">
                      I want to:
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 flex flex-col items-center ${
                          formData.role === 'buyer' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => handleChange({ target: { name: 'role', value: 'buyer' } })}
                      >
                        <svg className={`h-10 w-10 mb-2 ${formData.role === 'buyer' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className={`font-medium ${formData.role === 'buyer' ? 'text-blue-700' : 'text-gray-700'}`}>Buy Properties</span>
                      </div>
                      <div 
                                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 flex flex-col items-center ${
                                                formData.role === 'seller' 
                                                  ? 'border-purple-500 bg-purple-50' 
                                                  : 'border-gray-200 hover:border-purple-300'
                                              }`}
                                              onClick={() => handleChange({ target: { name: 'role', value: 'seller' } })}
                                            >
                                              <svg className={`h-10 w-10 mb-2 ${formData.role === 'seller' ? 'text-purple-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                              </svg>
                                              <span className={`font-medium ${formData.role === 'seller' ? 'text-purple-700' : 'text-gray-700'}`}>Sell Properties</span>
                                            </div>
          </div>
        </div>

                                        <div className="mt-8 flex justify-between">
                                          <button
                                            type="button"
                                            onClick={prevStep}
                                            className="px-6 py-3 bg-gray-200 rounded-lg text-gray-700 font-medium transition-all duration-200 transform hover:bg-gray-300 hover:-translate-x-1 flex items-center"
                                          >
                                            <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            Back
                                          </button>
        <button
          type="submit"
                                            disabled={loading || !formData.walletAddress}
                                            className={`px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 flex items-center ${
                                              loading || !formData.walletAddress
                                                ? 'bg-gray-300 cursor-not-allowed' 
                                                : 'bg-gradient-to-r from-blue-600 to-purple-700 hover:shadow-lg hover:scale-105 active:scale-95'
                                            }`}
                                          >
                                            {loading ? (
                                              <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating Account...
                                              </>
                                            ) : (
                                              <>
                                                Complete Registration
                                                <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                              </>
                                            )}
        </button>
                                        </div>
                                      </div>
      </form>
                                  </div>
                                  
                                  {/* Footer */}
                                  <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
                                    <p className="text-center text-gray-600">
                                      Already have an account?{' '}
                                      <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 inline-flex items-center">
                                        Sign in here
                                        <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                      </Link>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                      
                            <style jsx>{`
                              @keyframes fade-in {
                                from { opacity: 0; transform: translateY(-10px); }
                                to { opacity: 1; transform: translateY(0); }
                              }
                              .animate-fade-in {
                                animation: fade-in 0.3s ease-out;
                              }
                              .shadow-glow {
                                box-shadow: 0 0 15px 5px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                              }
                              @keyframes pulse {
                                0%, 100% { opacity: 0.2; transform: scale(1); }
                                50% { opacity: 0.3; transform: scale(1.05); }
                              }
                              .animate-pulse {
                                animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                              }
                            `}</style>
                          </div>
  );
};

export default Register; 