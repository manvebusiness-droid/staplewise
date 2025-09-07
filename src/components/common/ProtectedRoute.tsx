import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  console.log('🛡️ ProtectedRoute - User:', user?.email, 'Role:', user?.role, 'Allowed:', allowedRoles);

  if (!user) {
    console.log('🚫 ProtectedRoute - No user, redirecting to home');
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    console.log('🚫 ProtectedRoute - Role not allowed, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('✅ ProtectedRoute - Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;