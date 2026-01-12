// import { Navigate, Outlet } from 'react-router-dom';
// import { useAuthStore } from '@/context/userContext';
// import MainSidebar from '../../Mainsidebar/Sidebar';
// import { useEffect } from 'react';

// export const ProtectedRoute = () => {
//   const { user } = useAuthStore();
//   console.log('ProtectedRoute - Current user:', user);

//   useEffect(() => {
//     console.log('ProtectedRoute mounted with user:', user);
//   }, [user]);

//   if (!user) {
//     console.log('No user found - redirecting to login');
//     return <Navigate to="/login" replace />;
//   }

//   return (
//     <MainSidebar>
//       <Outlet />
//     </MainSidebar>
//   );
// };




// // src/Auth/Protectedroutes/RoleProtectedRoute.tsx
// import { Navigate, Outlet } from 'react-router-dom';
// import { useAuthStore } from '@/context/userContext';
// import MainSidebar from '../../Mainsidebar/Sidebar';

// interface RoleProtectedRouteProps {
//   requiredRole: 'user' | 'admin';
//   redirectTo: string;
// }

// export const RoleProtectedRoute = ({ requiredRole, redirectTo }: RoleProtectedRouteProps) => {
//   const { user } = useAuthStore();

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   // Allow access if user has the required role
//   if (user.role === requiredRole) {
//     // For admin routes, wrap with MainSidebar (dashboard layout)
//     if (requiredRole === 'admin') {
//       return (
//         <MainSidebar>
//           <Outlet />
//         </MainSidebar>
//       );
//     }

//     // For user routes, just render the outlet (e-commerce layout is handled in individual components)
//     return <Outlet />;
//   }

//   // Redirect if user doesn't have the required role
//   return <Navigate to={redirectTo} replace />;
// };













// // src/Auth/Protectedroutes/ProtectedRoutes.tsx
// import { Navigate, Outlet } from 'react-router-dom';
// import { useAuthStore } from '@/context/userContext';
// import MainSidebar from '../../Mainsidebar/Sidebar';

// interface RoleProtectedRouteProps {
//   requiredRole: 'user' | 'admin';
//   redirectTo: string;
// }

// export const RoleProtectedRoute = ({ requiredRole, redirectTo }: RoleProtectedRouteProps) => {
//   const { user } = useAuthStore();

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   // ✅ Map backend roles to frontend role system
//   const isAdmin = 
//     user.role === 'super_admin' || 
//     user.role === 'digital_marketer_admin' || 
//     user.role === 'client_admin';
  
//   const isUser = user.role === 'client';

//   // ✅ Check if user has required role using the mapped values
//   const hasRequiredRole = 
//     (requiredRole === 'admin' && isAdmin) || 
//     (requiredRole === 'user' && isUser);

//   if (!hasRequiredRole) {
//     return <Navigate to={redirectTo} replace />;
//   }

//   // For admin routes, wrap with MainSidebar (dashboard layout)
//   if (requiredRole === 'admin') {
//     return (
//       <MainSidebar>
//         <Outlet />
//       </MainSidebar>
//     );
//   }

//   // For user routes, just render the outlet (e-commerce layout is handled in individual components)
//   return <Outlet />;
// };










// src/Auth/Protectedroutes/ProtectedRoutes.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/context/userContext';
import MainSidebar from '../../Mainsidebar/Sidebar';

interface RoleProtectedRouteProps {
  requiredRole: 'user' | 'admin' | 'agent';
  redirectTo: string;
}

export const RoleProtectedRoute = ({ requiredRole, redirectTo }: RoleProtectedRouteProps) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Map backend roles to frontend role system
  const isAdmin = 
    user.role === 'super_admin' || 
    user.role === 'digital_marketer_admin' || 
    user.role === 'client_admin';
  
  const isUser = user.role === 'client';
  
  const isAgent = user.role === 'agent';

  // Check if user has required role using the mapped values
  const hasRequiredRole = 
    (requiredRole === 'admin' && isAdmin) || 
    (requiredRole === 'user' && isUser) ||
    (requiredRole === 'agent' && isAgent);

  if (!hasRequiredRole) {
    return <Navigate to={redirectTo} replace />;
  }

  // For admin and agent routes, wrap with MainSidebar (dashboard layout)
  if (requiredRole === 'admin' || requiredRole === 'agent') {
    return (
      <MainSidebar>
        <Outlet />
      </MainSidebar>
    );
  }

  // For user routes, just render the outlet
  return <Outlet />;
};
