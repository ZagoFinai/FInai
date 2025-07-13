import React, { useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function AdminAccess() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return <AdminLogin onLogin={handleLogin} />;
}