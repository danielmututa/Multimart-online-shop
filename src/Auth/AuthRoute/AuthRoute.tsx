// src/Auth/AuthRoute/AuthRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/context/userContext';

export const AuthRoute = () => {
  const { user, isLoading } = useAuthStore();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If user is already authenticated, redirect based on role
  if (user) {
    // Admin roles go to admin dashboard
    if (user.role === 'super_admin' || user.role === 'digital_marketer_admin' || user.role === 'client_admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } 
    // Agents go to agent dashboard
    else if (user.role === 'agent') {
      return <Navigate to="/agent-dashboard" replace />;
    }
    // Regular users go to home page (root)
    else if (user.role === 'client') {
      return <Navigate to="/" replace />;
    }
  }

  // Otherwise, render the auth content (login/register)
  return <Outlet />;
};






// // src/Auth/AuthRoute/AuthRoute.tsx
// import { Navigate, Outlet } from 'react-router-dom';
// import { useAuthStore } from '@/context/userContext';

// export const AuthRoute = () => {
//   const { user } = useAuthStore();

//   // If user is already authenticated, redirect based on role
//   if (user) {
//     if (user.role === 'admin') {
//       return <Navigate to="/" replace />;
//     } else {
//       return <Navigate to="/home" replace />;
//     }
//   }

//   // Otherwise, render the auth content (login/register)
//   return <Outlet />;
// };