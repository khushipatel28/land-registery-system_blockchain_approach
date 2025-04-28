import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ChevronRight, Lock, FileText, Search, Zap, Wallet, Smartphone, 
         ShieldCheck, DollarSign, Clock, Eye, Twitter, Facebook, Linkedin, 
         Github, Mail, Phone, MapPin, Link, Menu, X } from 'lucide-react';

export default function LandRegistryHomepage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Auto-rotate slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3);
    }, 5000);
    
    return () => clearInterval(interval);
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
  
  return (
    <div className="font-sans text-gray-800 bg-gray-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-gray-800 text-white z-50 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="#home" className="flex items-center text-xl font-bold" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>
            <Link className="mr-2 text-green-500" size={24} />
            <span>BlockLand Registry</span>
          </a>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="#home" className="hover:text-green-400 transition-colors" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Home</a>
            <a href="#features" className="hover:text-green-400 transition-colors" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
            <a href="#how-it-works" className="hover:text-green-400 transition-colors" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>How It Works</a>
            <a href="#benefits" className="hover:text-green-400 transition-colors" onClick={(e) => { e.preventDefault(); scrollToSection('benefits'); }}>Benefits</a>
            <a href="#contact" className="hover:text-green-400 transition-colors" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>
            <RouterLink to="/login" className="hover:text-green-400 transition-colors">Login</RouterLink>
            <RouterLink to="/register" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors">Register</RouterLink>
          </div>
          
          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-800 py-4 px-4 shadow-lg">
            <div className="flex flex-col space-y-4">
              <a href="#home" className="text-center py-2 hover:text-green-400" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Home</a>
              <a href="#features" className="text-center py-2 hover:text-green-400" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
              <a href="#how-it-works" className="text-center py-2 hover:text-green-400" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>How It Works</a>
              <a href="#benefits" className="text-center py-2 hover:text-green-400" onClick={(e) => { e.preventDefault(); scrollToSection('benefits'); }}>Benefits</a>
              <a href="#contact" className="text-center py-2 hover:text-green-400" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>
              <RouterLink to="/login" className="text-center py-2 hover:text-green-400">Login</RouterLink>
              <RouterLink to="/register" className="bg-green-600 hover:bg-green-700 py-2 rounded transition-colors text-center">Register</RouterLink>
            </div>
          </div>
        )}
      </nav>
      
      {/* Banner/Slider */}
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
            <div className="text-center text-white max-w-4xl px-6 z-10">
              {index === 0 && (
                <>
                  <h1 className="text-4xl md:text-6xl font-bold mb-6">Revolutionizing Land Registry with Blockchain</h1>
                  <p className="text-xl mb-8">Secure, transparent, and efficient land ownership transfers without intermediaries.</p>
                  <button 
                    className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-md text-white font-medium inline-flex items-center transition-transform hover:translate-y-[-3px]"
                    onClick={() => scrollToSection('how-it-works')}
                  >
                    Learn How It Works <ChevronRight className="ml-1" size={18} />
                  </button>
                </>
              )}
              {index === 1 && (
                <>
                  <h1 className="text-4xl md:text-6xl font-bold mb-6">Secure Your Land Ownership</h1>
                  <p className="text-xl mb-8">Immutable records stored on the Ethereum blockchain ensure your property rights are protected.</p>
                  <button 
                    className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-md text-white font-medium inline-flex items-center transition-transform hover:translate-y-[-3px]"
                    onClick={() => scrollToSection('features')}
                  >
                    Explore Features <ChevronRight className="ml-1" size={18} />
                  </button>
                </>
              )}
              {index === 2 && (
                <>
                  <h1 className="text-4xl md:text-6xl font-bold mb-6">Eliminate Fraud and Middlemen</h1>
                  <p className="text-xl mb-8">Our smart contracts automate verification and transfer processes, reducing costs and eliminating fraud.</p>
                  <button 
                    className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-md text-white font-medium inline-flex items-center transition-transform hover:translate-y-[-3px]"
                    onClick={() => scrollToSection('benefits')}
                  >
                    See Benefits <ChevronRight className="ml-1" size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        
        {/* Slider Navigation Dots */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-green-500' : 'bg-white bg-opacity-50'}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Key Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our blockchain-based land registry system offers innovative solutions to traditional land ownership challenges
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow-md transition-transform hover:translate-y-[-8px] hover:shadow-lg">
              <div className="bg-gray-800 text-white h-24 flex items-center justify-center">
                <Lock size={48} />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Secure Transactions</h3>
                <p className="text-gray-600">
                  Cryptographically secured transactions ensure that all property transfers are tamper-proof and permanently recorded on the blockchain.
                </p>
                </div>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow-md transition-transform hover:translate-y-[-8px] hover:shadow-lg">
              <div className="bg-gray-800 text-white h-24 flex items-center justify-center">
                <FileText size={48} />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Smart Contracts</h3>
                <p className="text-gray-600">
                  Automated smart contracts execute transfers based on predefined conditions, eliminating the need for intermediaries and reducing costs.
                </p>
                </div>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow-md transition-transform hover:translate-y-[-8px] hover:shadow-lg">
              <div className="bg-gray-800 text-white h-24 flex items-center justify-center">
                <Search size={48} />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Transparent History</h3>
                <p className="text-gray-600">
                  Complete transparency with full history of ownership, allowing instant verification of property rights and previous transactions.
                </p>
                </div>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow-md transition-transform hover:translate-y-[-8px] hover:shadow-lg">
              <div className="bg-gray-800 text-white h-24 flex items-center justify-center">
                <Zap size={48} />
            </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Fast Processing</h3>
                <p className="text-gray-600">
                  Significant reduction in processing time from weeks to minutes, making property transfers more efficient than ever before.
                </p>
        </div>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow-md transition-transform hover:translate-y-[-8px] hover:shadow-lg">
              <div className="bg-gray-800 text-white h-24 flex items-center justify-center">
                <Wallet size={48} />
                    </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">MetaMask Integration</h3>
                <p className="text-gray-600">
                  Seamless integration with MetaMask wallet allows for easy and secure cryptocurrency-based transactions.
                </p>
                    </div>
                </div>
                
            {/* Feature 6 */}
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow-md transition-transform hover:translate-y-[-8px] hover:shadow-lg">
              <div className="bg-gray-800 text-white h-24 flex items-center justify-center">
                <Smartphone size={48} />
                    </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">24/7 Accessibility</h3>
                <p className="text-gray-600">
                  Access your property records anytime, anywhere through our user-friendly web interface designed for all devices.
                </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our blockchain land registry system simplifies property transfers through a secure and transparent process
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            {/* Step 1 */}
            <div className="w-full md:w-64 text-center relative mb-8">
              <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 z-10 relative">1</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Connect Wallet</h3>
              <p className="text-gray-600">Link your MetaMask wallet to our platform to enable secure blockchain transactions.</p>
            </div>
            
            {/* Step 2 */}
            <div className="w-full md:w-64 text-center relative mb-8">
              <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 z-10 relative">2</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Verify Identity</h3>
              <p className="text-gray-600">Complete our secure identity verification process to ensure legitimate ownership.</p>
                </div>
                
            {/* Step 3 */}
            <div className="w-full md:w-64 text-center relative mb-8">
              <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 z-10 relative">3</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Register Property</h3>
              <p className="text-gray-600">Upload property documents and information to create a digital record on the blockchain.</p>
                </div>
                
            {/* Step 4 */}
            <div className="w-full md:w-64 text-center relative mb-8">
              <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 z-10 relative">4</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Transfer Ownership</h3>
              <p className="text-gray-600">Initiate and complete secure property transfers using our smart contract technology.</p>
            </div>
            </div>
        </div>
    </section>
    
      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose Blockchain Land Registry</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our system offers numerous advantages over traditional land registry methods
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-12">
            <div className="w-full lg:w-5/12 rounded-lg overflow-hidden shadow-lg">
              <img src="/api/placeholder/600/400" alt="Blockchain Land Registry Benefits" className="w-full h-auto" />
            </div>
            
            <div className="w-full lg:w-6/12">
              {/* Benefit 1 */}
              <div className="flex mb-8">
                <div className="text-green-600 mr-4">
                  <ShieldCheck size={36} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Enhanced Security</h3>
                  <p className="text-gray-600">Decentralized ledger technology prevents unauthorized modifications and protects against fraud and tampering.</p>
                        </div>
                    </div>
                    
              {/* Benefit 2 */}
              <div className="flex mb-8">
                <div className="text-green-600 mr-4">
                  <DollarSign size={36} />
                        </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Cost Reduction</h3>
                  <p className="text-gray-600">Eliminate intermediary fees and reduce transaction costs by up to 90% compared to traditional methods.</p>
                        </div>
                    </div>
                    
              {/* Benefit 3 */}
              <div className="flex mb-8">
                <div className="text-green-600 mr-4">
                  <Clock size={36} />
                        </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Time Efficiency</h3>
                  <p className="text-gray-600">Reduce processing time from weeks to minutes with automated verification and smart contract execution.</p>
                        </div>
                    </div>
                    
              {/* Benefit 4 */}
              <div className="flex">
                <div className="text-green-600 mr-4">
                  <Eye size={36} />
                        </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Complete Transparency</h3>
                  <p className="text-gray-600">Full visibility into property history, ownership records, and transaction details builds trust in the system.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
      {/* CTA Section */}
      <section className="py-16 bg-gray-800 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Land Registry Experience?</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto">
            Join thousands of property owners who have already secured their land ownership on the blockchain. Start using our platform today and experience the future of land registry.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <RouterLink to="/register" className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-md font-medium transition-transform hover:translate-y-[-3px] inline-block">
              Get Started
            </RouterLink>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} className="border-2 border-white hover:bg-white hover:bg-opacity-10 px-8 py-3 rounded-md font-medium transition-transform hover:translate-y-[-3px] inline-block">
              Contact Us
            </a>
            </div>
        </div>
    </section>
    
      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-400 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Column 1 */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6">BlockLand Registry</h3>
              <p className="mb-6">Revolutionizing land ownership through blockchain technology. Secure, transparent, and efficient property transfers without intermediaries.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:text-green-500 transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-white hover:text-green-500 transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="#" className="text-white hover:text-green-500 transition-colors">
                  <Linkedin size={20} />
                </a>
                <a href="#" className="text-white hover:text-green-500 transition-colors">
                  <Github size={20} />
                </a>
                    </div>
                </div>
                
            {/* Column 2 */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="#home" className="hover:text-green-500 transition-colors" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Home</a></li>
                <li><a href="#features" className="hover:text-green-500 transition-colors" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a></li>
                <li><a href="#how-it-works" className="hover:text-green-500 transition-colors" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>How It Works</a></li>
                <li><a href="#benefits" className="hover:text-green-500 transition-colors" onClick={(e) => { e.preventDefault(); scrollToSection('benefits'); }}>Benefits</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">FAQs</a></li>
                    </ul>
                </div>
                
            {/* Column 3 */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-green-500 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">API</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Smart Contracts</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Blog</a></li>
                    </ul>
                </div>
                
            {/* Column 4 */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Mail className="mr-3" size={18} /> info@blocklandregistry.com
                </li>
                <li className="flex items-center">
                  <Phone className="mr-3" size={18} /> +1 (123) 456-7890
                </li>
                <li className="flex items-center">
                  <MapPin className="mr-3" size={18} /> 123 Blockchain Way, Tech City
                </li>
                    </ul>
                </div>
            </div>
            
          <div className="border-t border-gray-800 pt-8 text-center">
                <p>&copy; 2025 BlockLand Registry. All rights reserved.</p>
            </div>
        </div>
    </footer>
    </div>
  );
}