import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import bannerImage from '../images/banner.jpg';

import { ChevronRight, Lock, FileText, Search, Zap, Wallet, Smartphone, 
         ShieldCheck, DollarSign, Clock, Eye, Twitter, Facebook, Linkedin, 
         Github, Mail, Phone, MapPin, Link, Menu, X, ArrowRight, 
         ArrowLeft, CheckCircle } from 'lucide-react';

export default function LandRegistryHomepage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState({});
  const [activeTab, setActiveTab] = useState('register');
  
  // Auto-rotate slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px"
    };
    
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    const sections = ['features', 'how-it-works', 'benefits', 'contact'];
    sections.forEach(section => {
      const element = document.getElementById(section);
      if (element) observer.observe(element);
    });
    
    return () => {
      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) observer.unobserve(element);
      });
    };
  }, []);
  
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 70,
        behavior: 'smooth'
      });
      setMobileMenuOpen(false);
    }
  };
  
  const switchTab = (tab) => {
    setActiveTab(tab);
  };
  
  // Previous and Next buttons for slider
  const prevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? 2 : prev - 1));
  };
  
  const nextSlide = () => {
    setCurrentSlide(prev => (prev === 2 ? 0 : prev + 1));
  };
  
  return (
    <div className="font-sans text-gray-800 bg-gray-50 overflow-x-hidden">
      {/* Floating scroll-to-top button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110 opacity-80 hover:opacity-100"
        style={{ display: window.scrollY > 300 ? 'block' : 'none' }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>

      {/* Navbar with glass effect */}
      <nav className="fixed top-0 left-0 w-full bg-blue-600 bg-opacity-95 backdrop-filter backdrop-blur-sm text-white z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="#home" className="flex items-center text-xl font-bold transition-transform hover:scale-105" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>
            <Link className="mr-2 text-white" size={24} />
            <span>BlockLand Registry</span>
          </a>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="#home" className="hover:text-blue-200 transition-colors relative group" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#features" className="hover:text-blue-200 transition-colors relative group" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#how-it-works" className="hover:text-blue-200 transition-colors relative group" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>
              How It Works
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#benefits" className="hover:text-blue-200 transition-colors relative group" onClick={(e) => { e.preventDefault(); scrollToSection('benefits'); }}>
              Benefits
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#contact" className="hover:text-blue-200 transition-colors relative group" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </a>
            <RouterLink to="/login" className="relative overflow-hidden px-4 py-2 rounded-md font-medium group">
              <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform translate-x-0 -skew-x-12 bg-white bg-opacity-10 group-hover:bg-opacity-30 skew-hover"></span>
              <span className="relative">Login</span>
            </RouterLink>
            <RouterLink to="/register" className="relative overflow-hidden px-6 py-2 rounded-md font-medium group">
              <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform translate-x-0 -skew-x-12 bg-white bg-opacity-30 group-hover:bg-opacity-40 skew-hover"></span>
              <span className="relative">Register</span>
            </RouterLink>
          </div>
          
          <button className="md:hidden text-white focus:outline-none transform transition hover:rotate-180 duration-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Menu - Animated Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-blue-700 py-4 px-4 shadow-lg animate-fadeDown">
            <div className="flex flex-col space-y-4">
              <a href="#home" className="text-center py-2 hover:bg-blue-600 hover:text-white transition-colors rounded-md" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Home</a>
              <a href="#features" className="text-center py-2 hover:bg-blue-600 hover:text-white transition-colors rounded-md" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
              <a href="#how-it-works" className="text-center py-2 hover:bg-blue-600 hover:text-white transition-colors rounded-md" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>How It Works</a>
              <a href="#benefits" className="text-center py-2 hover:bg-blue-600 hover:text-white transition-colors rounded-md" onClick={(e) => { e.preventDefault(); scrollToSection('benefits'); }}>Benefits</a>
              <a href="#contact" className="text-center py-2 hover:bg-blue-600 hover:text-white transition-colors rounded-md" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>
              <RouterLink to="/login" className="text-center py-2 hover:bg-blue-600 hover:text-white transition-colors rounded-md">Login</RouterLink>
              <RouterLink to="/register" className="bg-blue-500 hover:bg-blue-600 py-2 rounded-md transition-colors text-center">Register</RouterLink>
            </div>
          </div>
        )}
      </nav>
      
      {/* Banner/Slider with enhanced interactions */}
      <section id="home" className="pt-20 md:pt-16 relative h-screen max-h-screen min-h-[600px]">
        {[0, 1, 2].map((index) => (
          <div 
            key={index}
            className={`absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-1000 flex items-center justify-center ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={{
              backgroundImage: `url('/api/placeholder/1200/600')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="text-center text-white max-w-4xl px-6 z-10 transform transition-transform duration-1000 ease-out 
              ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}">
              {index === 0 && (
                <>
                  <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeInUp">Revolutionizing Land Registry with Blockchain</h1>
                  <p className="text-xl mb-8 animate-fadeInUp animation-delay-300">Secure, transparent, and efficient land ownership transfers without intermediaries.</p>
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md text-white font-medium inline-flex items-center transition-all hover:translate-y-[-3px] hover:shadow-lg animate-fadeInUp animation-delay-600"
                    onClick={() => scrollToSection('how-it-works')}
                  >
                    Learn How It Works <ChevronRight className="ml-1 animate-bounce-x" size={18} />
                  </button>
                </>
              )}
              {index === 1 && (
                <>
                  <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeInUp">Secure Your Land Ownership</h1>
                  <p className="text-xl mb-8 animate-fadeInUp animation-delay-300">Immutable records stored on the Ethereum blockchain ensure your property rights are protected.</p>
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md text-white font-medium inline-flex items-center transition-all hover:translate-y-[-3px] hover:shadow-lg animate-fadeInUp animation-delay-600"
                    onClick={() => scrollToSection('features')}
                  >
                    Explore Features <ChevronRight className="ml-1 animate-bounce-x" size={18} />
                  </button>
                </>
              )}
              {index === 2 && (
                <>
                  <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeInUp">Eliminate Fraud and Middlemen</h1>
                  <p className="text-xl mb-8 animate-fadeInUp animation-delay-300">Our smart contracts automate verification and transfer processes, reducing costs and eliminating fraud.</p>
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md text-white font-medium inline-flex items-center transition-all hover:translate-y-[-3px] hover:shadow-lg animate-fadeInUp animation-delay-600"
                    onClick={() => scrollToSection('benefits')}
                  >
                    See Benefits <ChevronRight className="ml-1 animate-bounce-x" size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        
        {/* Enhanced Slider Navigation */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center space-x-6">
          <button 
            onClick={prevSlide}
            className="p-2 rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 transition-all transform hover:scale-110"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          
          <div className="flex space-x-2">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-blue-500 w-10' 
                    : 'bg-white bg-opacity-50 hover:bg-opacity-70'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
          
          <button 
            onClick={nextSlide}
            className="p-2 rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 transition-all transform hover:scale-110"
          >
            <ArrowRight size={20} className="text-white" />
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-8 w-32 h-32 bg-blue-500 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-8 w-24 h-24 bg-blue-400 rounded-full opacity-10 animate-pulse delay-1000"></div>
      </section>
      
      {/* Features Section with Animation */}
      <section id="features" className={`py-20 bg-white transition-all duration-1000 ${isVisible.features ? 'opacity-100 transform-none' : 'opacity-0 translate-y-10'}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block p-1 px-3 mb-4 bg-blue-100 rounded-full text-blue-800 text-sm font-semibold">
              POWERFUL CAPABILITIES
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Innovative Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our blockchain-based land registry system offers revolutionary solutions to traditional land ownership challenges
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl duration-300">
              <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white h-24 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                <Lock size={48} className="relative z-10" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Secure Transactions</h3>
                <p className="text-gray-600">
                  Cryptographically secured transactions ensure that all property transfers are tamper-proof and permanently recorded on the blockchain.
                </p>
                <a href="#" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                  Learn more <ChevronRight size={16} className="ml-1" />
                </a>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl duration-300">
              <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white h-24 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                <FileText size={48} className="relative z-10" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Smart Contracts</h3>
                <p className="text-gray-600">
                  Automated smart contracts execute transfers based on predefined conditions, eliminating the need for intermediaries and reducing costs.
                </p>
                <a href="#" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                  Learn more <ChevronRight size={16} className="ml-1" />
                </a>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl duration-300">
              <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white h-24 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                <Search size={48} className="relative z-10" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Transparent History</h3>
                <p className="text-gray-600">
                  Complete transparency with full history of ownership, allowing instant verification of property rights and previous transactions.
                </p>
                <a href="#" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                  Learn more <ChevronRight size={16} className="ml-1" />
                </a>
              </div>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl duration-300">
              <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white h-24 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                <Zap size={48} className="relative z-10" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Fast Processing</h3>
                <p className="text-gray-600">
                  Significant reduction in processing time from weeks to minutes, making property transfers more efficient than ever before.
                </p>
                <a href="#" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                  Learn more <ChevronRight size={16} className="ml-1" />
                </a>
              </div>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl duration-300">
              <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white h-24 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                <Wallet size={48} className="relative z-10" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">MetaMask Integration</h3>
                <p className="text-gray-600">
                  Seamless integration with MetaMask wallet allows for easy and secure cryptocurrency-based transactions.
                </p>
                <a href="#" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                  Learn more <ChevronRight size={16} className="ml-1" />
                </a>
              </div>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl duration-300">
              <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white h-24 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                <Smartphone size={48} className="relative z-10" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">24/7 Accessibility</h3>
                <p className="text-gray-600">
                  Access your property records anytime, anywhere through our user-friendly web interface designed for all devices.
                </p>
                <a href="#" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                  Learn more <ChevronRight size={16} className="ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    
      {/* How It Works Section with Animation */}
      <section id="how-it-works" className={`py-20 bg-gray-50 transition-all duration-1000 ${isVisible['how-it-works'] ? 'opacity-100 transform-none' : 'opacity-0 translate-y-10'}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block p-1 px-3 mb-4 bg-blue-100 rounded-full text-blue-800 text-sm font-semibold">
              SIMPLE PROCESS
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our blockchain land registry system simplifies property transfers through a secure and transparent process
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-0 right-0 top-24 h-1 bg-blue-200 z-0 hidden md:block"></div>
              
              <div className="flex flex-wrap justify-center">
                {/* Step 1 */}
                <div className="w-full md:w-1/4 px-4 mb-12 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full flex items-center justify-center text-2xl font-bold z-10 shadow-lg transform transition-transform hover:scale-110 hover:rotate-12 duration-300">1</div>
                    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3 text-center">Connect Wallet</h3>
                    <p className="text-gray-600 text-center">Link your MetaMask wallet to our platform to enable secure blockchain transactions.</p>
                  </div>
                  <div className="hidden md:block absolute top-24 right-0 w-16 h-16 transform translate-x-8 -translate-y-8">
                    <svg className="w-full h-full text-blue-400" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14m-4 4l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                
                {/* Step 2 */}
                <div className="w-full md:w-1/4 px-4 mb-12 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full flex items-center justify-center text-2xl font-bold z-10 shadow-lg transform transition-transform hover:scale-110 hover:rotate-12 duration-300">2</div>
                    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3 text-center">Verify Identity</h3>
                    <p className="text-gray-600 text-center">Complete our secure identity verification process to ensure legitimate ownership.</p>
                  </div>
                  <div className="hidden md:block absolute top-24 right-0 w-16 h-16 transform translate-x-8 -translate-y-8">
                    <svg className="w-full h-full text-blue-400" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14m-4 4l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                
                {/* Step 3 */}
                <div className="w-full md:w-1/4 px-4 mb-12 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full flex items-center justify-center text-2xl font-bold z-10 shadow-lg transform transition-transform hover:scale-110 hover:rotate-12 duration-300">3</div>
                    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3 text-center">Register Property</h3>
                    <p className="text-gray-600 text-center">Upload property documents and information to create a digital record on the blockchain.</p>
                  </div>
                  <div className="hidden md:block absolute top-24 right-0 w-16 h-16 transform translate-x-8 -translate-y-8">
                    <svg className="w-full h-full text-blue-400" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14m-4 4l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                
                {/* Step 4 */}
                <div className="w-full md:w-1/4 px-4 mb-12">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full flex items-center justify-center text-2xl font-bold z-10 shadow-lg transform transition-transform hover:scale-110 hover:rotate-12 duration-300">4</div>
                    <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3 text-center">Transfer Ownership</h3>
                    <p className="text-gray-600 text-center">Initiate and complete secure property transfers using our smart contract technology.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Interactive Tabs */}
            <div className="mt-12 bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="flex border-b">
                <button 
                  className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${activeTab === 'register' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => switchTab('register')}
                >
                  Register Property
                </button>
                <button 
                  className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${activeTab === 'transfer' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => switchTab('transfer')}
                >
                  Transfer Property
                </button>
                <button 
                  className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${activeTab === 'verify' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => switchTab('verify')}
                >
                  Verify Ownership
                </button>
              </div>
              
              <div className="p-6">
                {activeTab === 'register' && (
                  <div className="animate-fadeIn">
                    <h3 className="text-xl font-bold mb-4">Register Your Property</h3>
                    <p className="mb-4">Registering your property on our blockchain platform provides immutable proof of ownership and simplifies future transfers.</p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle size={20} className="text-green-500 mr-2 mt-1" />
                        <span>Upload property documents and verification</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle size={20} className="text-green-500 mr-2 mt-1" />
                        <span>Pay one-time registration fee</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle size={20} className="text-green-500 mr-2 mt-1" />
                        <span>Receive digital certificate of ownership</span>
                      </li>
                    </ul>
                    <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md shadow-md transition-all hover:shadow-lg">
                      Start Registration
                    </button>
                  </div>
                )}
                
                {activeTab === 'transfer' && (
                  <div className="animate-fadeIn">
                    <h3 className="text-xl font-bold mb-4">Transfer Property Ownership</h3>
                    <p className="mb-4">Transfer property to another person securely and transparently with our smart contract technology.</p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle size={20} className="text-green-500 mr-2 mt-1" />
                        <span>Initiate transfer to recipient's address</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle size={20} className="text-green-500 mr-2 mt-1" />
                        <span>Both parties sign the transaction</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle size={20} className="text-green-500 mr-2 mt-1" />
                        <span>Ownership transfer is recorded permanently</span>
                      </li>
                    </ul>
                    <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md shadow-md transition-all hover:shadow-lg">
                      Start Transfer Process
                    </button>
                  </div>
                )}
                
                {activeTab === 'verify' && (
                  <div className="animate-fadeIn">
                    <h3 className="text-xl font-bold mb-4">Verify Property Ownership</h3>
                    <p className="mb-4">Instantly verify the current owner of any property registered on our platform.</p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle size={20} className="text-green-500 mr-2 mt-1" />
                        <span>Enter property identification number</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle size={20} className="text-green-500 mr-2 mt-1" />
                        <span>View complete ownership history</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle size={20} className="text-green-500 mr-2 mt-1" />
                        <span>Download verification certificate</span>
                      </li>
                    </ul>
                    <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md shadow-md transition-all hover:shadow-lg">
                      Verify Property
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    
      {/* Benefits Section with Animation */}
      <section id="benefits" className={`py-20 bg-white transition-all duration-1000 ${isVisible.benefits ? 'opacity-100 transform-none' : 'opacity-0 translate-y-10'}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block p-1 px-3 mb-4 bg-blue-100 rounded-full text-blue-800 text-sm font-semibold">
              WHY CHOOSE US
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose Blockchain Land Registry</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our system offers numerous advantages over traditional land registry methods
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-12">
            <div className="w-full lg:w-5/12 rounded-2xl overflow-hidden shadow-2xl group relative">
              <img src={bannerImage} alt="Blockchain Land Registry Benefits" className="w-full h-auto transform transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900 to-transparent opacity-60"></div>
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Next Generation Property Management</h3>
                <p>Experience the future of secure ownership records</p>
              </div>
            </div>
            
            <div className="w-full lg:w-6/12">
              {/* Benefit 1 */}
              <div className="flex mb-8 p-4 hover:bg-blue-50 rounded-lg transition-colors items-start">
                <div className="text-blue-600 mr-4 p-3 bg-blue-100 rounded-full">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Enhanced Security</h3>
                  <p className="text-gray-600">Decentralized ledger technology prevents unauthorized modifications and protects against fraud and tampering. Your property records are cryptographically secured.</p>
                </div>
              </div>
                    
              {/* Benefit 2 */}
              <div className="flex mb-8 p-4 hover:bg-blue-50 rounded-lg transition-colors items-start">
                <div className="text-blue-600 mr-4 p-3 bg-blue-100 rounded-full">
                  <DollarSign size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Cost Reduction</h3>
                  <p className="text-gray-600">Eliminate intermediary fees and reduce transaction costs by up to 90% compared to traditional methods. Save thousands in unnecessary legal and administrative expenses.</p>
                </div>
              </div>
                    
              {/* Benefit 3 */}
              <div className="flex mb-8 p-4 hover:bg-blue-50 rounded-lg transition-colors items-start">
                <div className="text-blue-600 mr-4 p-3 bg-blue-100 rounded-full">
                  <Clock size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Time Efficiency</h3>
                  <p className="text-gray-600">Reduce processing time from weeks to minutes with automated verification and smart contract execution. No more waiting for paperwork to be processed by multiple departments.</p>
                </div>
              </div>
                    
              {/* Benefit 4 */}
              <div className="flex p-4 hover:bg-blue-50 rounded-lg transition-colors items-start">
                <div className="text-blue-600 mr-4 p-3 bg-blue-100 rounded-full">
                  <Eye size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Complete Transparency</h3>
                  <p className="text-gray-600">Full visibility into property history, ownership records, and transaction details builds trust in the system. Access your records anytime and share them securely when needed.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Testimonials */}
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-center mb-10">What Our Users Say</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Testimonial 1 */}
              <div className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    JD
                  </div>
                  <div>
                    <h4 className="font-bold">John Doe</h4>
                    <p className="text-sm text-gray-600">Property Owner</p>
                  </div>
                </div>
                <p className="text-gray-700">"I registered my property in minutes, not weeks. The security and peace of mind knowing my ownership is blockchain-protected is invaluable."</p>
                <div className="mt-4 flex text-yellow-400">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                </div>
              </div>
              
              {/* Testimonial 2 */}
              <div className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    JS
                  </div>
                  <div>
                    <h4 className="font-bold">Jane Smith</h4>
                    <p className="text-sm text-gray-600">Real Estate Agent</p>
                  </div>
                </div>
                <p className="text-gray-700">"As a real estate professional, this platform has changed how I handle transactions. It's faster, more secure, and my clients love the transparency."</p>
                <div className="mt-4 flex text-yellow-400">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                </div>
              </div>
              
              {/* Testimonial 3 */}
              <div className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    RJ
                  </div>
                  <div>
                    <h4 className="font-bold">Robert Johnson</h4>
                    <p className="text-sm text-gray-600">Property Developer</p>
                  </div>
                </div>
                <p className="text-gray-700">"For my development projects, having a secure, verifiable record of ownership history is crucial. This platform delivers exactly that with remarkable efficiency."</p>
                <div className="mt-4 flex text-yellow-400">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    
      {/* CTA Section with Animation */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-600 z-0"></div>
        <div className="absolute inset-0 opacity-10 z-0">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full transform translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Land Registry Experience?</h2>
            <p className="text-xl mb-10 max-w-3xl mx-auto opacity-90">
              Join thousands of property owners who have already secured their land ownership on the blockchain. Start using our platform today and experience the future of land registry.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <RouterLink to="/register" className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-lg font-medium transition-all hover:shadow-xl hover:-translate-y-1 inline-flex items-center justify-center">
                <span>Get Started Now</span>
                <ChevronRight size={20} className="ml-2" />
              </RouterLink>
              <a 
                href="#contact" 
                onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} 
                className="border-2 border-white hover:bg-white hover:text-blue-700 px-8 py-4 rounded-lg font-medium transition-all hover:shadow-xl hover:-translate-y-1 inline-flex items-center justify-center"
              >
                <span>Contact Our Team</span>
                <ChevronRight size={20} className="ml-2" />
              </a>
            </div>
            
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold">15k+</div>
                <div className="opacity-80 mt-2">Properties Registered</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">5k+</div>
                <div className="opacity-80 mt-2">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">99.9%</div>
                <div className="opacity-80 mt-2">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">24/7</div>
                <div className="opacity-80 mt-2">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    
      {/* Contact Section with Animation */}
      <section id="contact" className={`py-20 bg-white transition-all duration-1000 ${isVisible.contact ? 'opacity-100 transform-none' : 'opacity-0 translate-y-10'}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block p-1 px-3 mb-4 bg-blue-100 rounded-full text-blue-800 text-sm font-semibold">
              GET IN TOUCH
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions about our blockchain land registry platform? Our team is here to help.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-blue-50 p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Send Us a Message</h3>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="name">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="How can we help you?"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Your message here..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-all hover:shadow-lg inline-flex items-center"
                >
                  <span>Send Message</span>
                  <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </form>
            </div>
            
            <div>
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h3>
                
                <ul className="space-y-6">
                  <li className="flex items-start">
                    <Mail className="text-blue-600 mr-4 mt-1" size={24} />
                    <div>
                      <p className="font-medium text-gray-800">Email Us</p>
                      <a href="mailto:info@blocklandregistry.com" className="text-blue-600 hover:text-blue-800 transition-colors">info@blocklandregistry.com</a>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <Phone className="text-blue-600 mr-4 mt-1" size={24} />
                    <div>
                      <p className="font-medium text-gray-800">Call Us</p>
                      <a href="tel:+11234567890" className="text-blue-600 hover:text-blue-800 transition-colors">+1 (123) 456-7890</a>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <MapPin className="text-blue-600 mr-4 mt-1" size={24} />
                    <div>
                      <p className="font-medium text-gray-800">Visit Us</p>
                      <p className="text-gray-600">123 Blockchain Way, Tech City, TC 10101</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h3>
                
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="font-medium text-gray-800 mb-2">How secure is the blockchain registry?</h4>
                    <p className="text-gray-600">Our platform utilizes the Ethereum blockchain, providing cryptographic security that makes tampering with records virtually impossible.</p>
                  </div>
                  
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="font-medium text-gray-800 mb-2">Do I need technical knowledge to use the platform?</h4>
                    <p className="text-gray-600">No, our user-friendly interface is designed for everyone. The technical complexity is handled behind the scenes.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Is the blockchain registry legally recognized?</h4>
                    <p className="text-gray-600">We work with local authorities to ensure our registry complies with legal requirements in supported jurisdictions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    
      {/* Footer with Animation */}
      <footer className="bg-blue-900 text-blue-100 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Column 1 */}
            <div>
              <div className="flex items-center text-xl font-bold mb-6">
                <Link className="mr-2 text-white" size={24} />
                <span>BlockLand Registry</span>
              </div>
              <p className="mb-6 text-blue-200">Revolutionizing land ownership through blockchain technology. Secure, transparent, and efficient property transfers without intermediaries.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-blue-200 hover:text-white transition-colors p-2 rounded-full hover:bg-blue-800">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-blue-200 hover:text-white transition-colors p-2 rounded-full hover:bg-blue-800">
                  <Facebook size={20} />
                </a>
                <a href="#" className="text-blue-200 hover:text-white transition-colors p-2 rounded-full hover:bg-blue-800">
                  <Linkedin size={20} />
                </a>
                <a href="#" className="text-blue-200 hover:text-white transition-colors p-2 rounded-full hover:bg-blue-800">
                  <Github size={20} />
                </a>
              </div>
            </div>
                
            {/* Column 2 */}
            <div>
              <h3 className="text-lg font-bold mb-6 border-b border-blue-800 pb-2">Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="#home" className="inline-block hover:text-white transition-colors hover:translate-x-1 transform" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Home</a></li>
                <li><a href="#features" className="inline-block hover:text-white transition-colors hover:translate-x-1 transform" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a></li>
                <li><a href="#how-it-works" className="inline-block hover:text-white transition-colors hover:translate-x-1 transform" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>How It Works</a></li>
                <li><a href="#benefits" className="inline-block hover:text-white transition-colors hover:translate-x-1 transform" onClick={(e) => { e.preventDefault(); scrollToSection('benefits'); }}>Benefits</a></li>
                <li><a href="#" className="inline-block hover:text-white transition-colors hover:translate-x-1 transform">FAQs</a></li>
              </ul>
            </div>
                
            {/* Column 3 */}
            <div>
              <h3 className="text-lg font-bold mb-6 border-b border-blue-800 pb-2">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="inline-block hover:text-white transition-colors hover:translate-x-1 transform">Documentation</a></li>
                <li><a href="#" className="inline-block hover:text-white transition-colors hover:translate-x-1 transform">Tutorials</a></li>
                <li><a href="#" className="inline-block hover:text-white transition-colors hover:translate-x-1 transform">API</a></li>
                <li><a href="#" className="inline-block hover:text-white transition-colors hover:translate-x-1 transform">Smart Contracts</a></li>
                <li><a href="#" className="inline-block hover:text-white transition-colors hover:translate-x-1 transform">Blog</a></li>
              </ul>
            </div>
                
            {/* Column 4 */}
            <div>
              <h3 className="text-lg font-bold mb-6 border-b border-blue-800 pb-2">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <Mail className="mr-3 text-blue-300" size={18} />
                  <a href="mailto:info@blocklandregistry.com" className="hover:text-white transition-colors">
                    info@blocklandregistry.com
                  </a>
                </li>
                <li className="flex items-center">
                  <Phone className="mr-3 text-blue-300" size={18} />
                  <a href="tel:+11234567890" className="hover:text-white transition-colors">
                    +1 (123) 456-7890
                  </a>
                </li>
                <li className="flex items-start">
                  <MapPin className="mr-3 text-blue-300 mt-1" size={18} />
                  <span>123 Blockchain Way, Tech City, TC 10101</span>
                </li>
              </ul>
              
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Subscribe to our newsletter</h4>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="px-4 py-2 rounded-l-lg focus:outline-none text-gray-800 w-full"
                  />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
            
          <div className="border-t border-blue-800 pt-8 text-center text-blue-300">
            <p>&copy; 2025 BlockLand Registry. All rights reserved.</p>
            <div className="mt-2 flex justify-center space-x-4 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes bounceX {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        
        .animate-fadeDown {
          animation: fadeDown 0.3s ease-out forwards;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        
        .animate-bounce-x {
          animation: bounceX 1.5s infinite;
        }
        
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        
        .skew-hover:hover {
          transform: skew(-12deg);
        }
      `}</style>
    </div>
  );
}