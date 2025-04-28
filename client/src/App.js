import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Home1 from './pages/Home1';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LandDetails from './pages/LandDetails';
import RegisterLand from './pages/RegisterLand';
import { AuthProvider, useAuth } from './context/AuthContext';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import PurchaseRequests from './pages/PurchaseRequests';
import PrivateRoute from './components/PrivateRoute';

const AppContent = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className={`min-h-screen ${!isHomePage ? 'bg-gray-100' : ''}`}>
      {!isHomePage && !isAuthPage && <Navbar />}
      {!isHomePage ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`container mx-auto px-4 ${!isAuthPage ? 'py-8' : ''}`}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/land/:id" element={<LandDetails />} />
            
            <Route path="/" element={<PrivateRoute />}>
              <Route path="dashboard" element={<RoleBasedDashboard />} />
              <Route path="buyer-dashboard" element={<BuyerDashboard />} />
              <Route path="seller-dashboard" element={<SellerDashboard />} />
              <Route path="land/:id" element={<LandDetails />} />
              <Route path="register-land" element={<RegisterLand />} />
              <Route path="land/:id/purchase-requests" element={<PurchaseRequests />} />
            </Route>
          </Routes>
        </motion.div>
      ) : (
        <Routes>
          <Route path="/" element={<Home1 />} />
        </Routes>
      )}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

// Component to handle role-based dashboard redirection
function RoleBasedDashboard() {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'buyer':
      return <Navigate to="/buyer-dashboard" replace />;
    case 'seller':
      return <Navigate to="/seller-dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default App;
