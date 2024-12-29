import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from './Auth';

const ProtectedRoute = ({ children }) => {
  const user = isAuthenticated();

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
