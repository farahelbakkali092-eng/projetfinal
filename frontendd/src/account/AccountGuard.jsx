import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AccountGuard = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  // Si l'utilisateur est un admin, il ne doit pas accéder à l'espace client
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default AccountGuard;
