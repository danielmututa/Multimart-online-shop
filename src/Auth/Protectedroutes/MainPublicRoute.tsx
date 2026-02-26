// src/Auth/Protectedroutes/MainPublicRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/context/userContext';

/**
 * Guard for public landing pages (Home, About, etc.)
 * Redirects logged-in Admins and Agents to their respective dashboards.
 * regular customers (clients) and guests can still see the pages.
 */
export const MainPublicRoute = () => {
  const { user } = useAuthStore();

  if (user) {
    const isAdmin = user.role === 'super_admin' || 
                    user.role === 'digital_marketer_admin' || 
                    user.role === 'client_admin';
    
    const isAgent = user.role === 'agent';

    if (isAdmin) {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (isAgent) {
      return <Navigate to="/agent-dashboard" replace />;
    }
  }

  // If no user or regular client, allow access to public pages
  return <Outlet />;
};
