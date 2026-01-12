// src/Auth/RoleBaseselection.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/context/userContext';
import MainSidebar from '../Mainsidebar/Sidebar';

interface RoleProtectedRouteProps {
  requiredRole: 'user' | 'admin' | 'agent'| 'client_admin';
  redirectTo: string;
}

export const RoleProtectedRoute = ({ requiredRole, redirectTo }: RoleProtectedRouteProps) => {
  const { user } = useAuthStore();
  const location = useLocation();

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Map backend roles to frontend role system
  const isAdmin = 
                  user.role === 'super_admin' || 
                  user.role === 'digital_marketer_admin' || 
                  user.role === 'client_admin';
  
  const isUser = user.role === 'client';
  const isAgent = user.role === 'agent'; // ✅ Added Agent check

  // Check if user has required role
  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole === 'user' && !isUser) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole === 'agent' && !isAgent) { // ✅ Added Agent protection
    return <Navigate to={redirectTo} replace />;
  }

  // Special protection for /users route - only super_admin and digital_marketer_admin
  if (location.pathname === '/users') {
    if (user.role !== 'super_admin' && user.role !== 'digital_marketer_admin') {
      return <Navigate to="/" replace />; // Redirect to admin dashboard
    }
  }

  // For admin routes, wrap with MainSidebar
  if (requiredRole === 'admin') {
    return (
      <MainSidebar>
        <Outlet />
      </MainSidebar>
    );
  }

  // For agent routes, you can also wrap with MainSidebar if needed
  if (requiredRole === 'agent') {
    return (
      <MainSidebar>
        <Outlet />
      </MainSidebar>
    );
  }

  // For user routes, just render the outlet
  return <Outlet />;
};