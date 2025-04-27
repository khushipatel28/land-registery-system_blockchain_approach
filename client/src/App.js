import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
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

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8"
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/land/:id" element={<LandDetails />} />
              
              <Route path="/" element={<PrivateRoute />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<RoleBasedDashboard />} />
                <Route path="land/:id" element={<LandDetails />} />
                <Route path="register-land" element={<RegisterLand />} />
                <Route path="purchase-requests/:landId" element={<PurchaseRequests />} />
              </Route>
            </Routes>
          </motion.div>
        </div>
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
      return <BuyerDashboard />;
    case 'seller':
      return <SellerDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default App;
