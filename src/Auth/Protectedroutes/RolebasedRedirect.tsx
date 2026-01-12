// src/Auth/Protectedroutes/RolebasedRedirect.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/context/userContext';

const RoleBasedRedirect = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check admin roles
  const isAdmin = user.role === 'super_admin' || 
                  user.role === 'digital_marketer_admin' || 
                  user.role === 'client_admin';

  // Check agent role
  const isAgent = user.role === 'agent';

  if (isAdmin) {
    return <Navigate to="/" replace />; // Admin dashboard
  } else if (isAgent) {
    return <Navigate to="/agent-dashboard" replace />; // Agent dashboard
  } else {
    return <Navigate to="/home" replace />; // User home page
  }
};

export default RoleBasedRedirect;























// // src/Auth/Protectedroutes/RolebasedRedirect.tsx
// import { Navigate } from 'react-router-dom';
// import { useAuthStore } from '@/context/userContext';

// const RoleBasedRedirect = () => {
//   const { user } = useAuthStore();

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   // ✅ FIXED: Removed 'admin' role check (it doesn't exist in your backend)
//   const isAdmin = user.role === 'super_admin' || 
//                   user.role === 'digital_marketer_admin' || 
//                   user.role === 'client_admin';

//   if (isAdmin) {
//     return <Navigate to="/" replace />; // Admin dashboard
//   } else {
//     return <Navigate to="/home" replace />; // User home page
//   }
// };

// export default RoleBasedRedirect;









// // src/Auth/Protectedroutes/RoleBasedRedirect.tsx
// import { Navigate } from 'react-router-dom';
// import { useAuthStore } from '@/context/userContext';

// const RoleBasedRedirect = () => {
//   const { user } = useAuthStore();

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   // Redirect based on user role
//   if (user.role === 'admin') {
//     return <Navigate to="/" replace />;
//   } else {
//     return <Navigate to="/home" replace />;
//   }
// };

// export default RoleBasedRedirect;