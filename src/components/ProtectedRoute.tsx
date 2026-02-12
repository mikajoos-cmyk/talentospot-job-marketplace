import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'candidate' | 'employer' | 'admin' | ('candidate' | 'employer' | 'admin')[];
  allowOwnProfilePreview?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, allowOwnProfilePreview }) => {
  const { user, isAuthenticated, loading, logout } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user.status === 'banned') {
    logout();
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!roles.includes(user.role)) {
      // Ausnahme für Kandidaten, die ihr eigenes Profil in der Vorschau sehen wollen
      if (allowOwnProfilePreview && user.role === 'candidate') {
        console.log('[ProtectedRoute] Allowing candidate to preview own profile');
        return <>{children}</>;
      }

      console.log('[ProtectedRoute] Access denied. User role:', user.role, 'Required:', roles);
      let redirectPath = '/';
      if (user.role === 'candidate') redirectPath = '/candidate/dashboard';
      else if (user.role === 'employer') redirectPath = '/employer/dashboard';
      else if (user.role === 'admin') redirectPath = '/admin/dashboard';

      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
