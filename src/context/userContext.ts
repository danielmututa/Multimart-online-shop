import { create } from 'zustand';
import { User } from '../components/interfaces/auth';
import { toast } from 'react-toastify';

// Cookie helper functions
const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const isLocalhost = window.location.hostname === 'localhost';
  const secure = isLocalhost ? '' : ';Secure';
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict${secure}`;
};

const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

interface ApiError {
  message: string;
  [key: string]: unknown;
}

function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'message' in error;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  initializeAuth: () => void;
  login: (email: string, password: string, role?: string, isAdmin?: boolean, username?: string, phone?: string) => Promise<void>;
register: (userData: {
  username?: string;
  name?: string;
  email: string;
  phone: string;
  password: string;
  confirmpassword: string;
  role: string;

  // OAuth providers
  authProvider?: string;
  googleId?: string;
  appleId?: string;
  facebookId?: string;

  // Agent fields
  commissionRate?: number;
  payoutMethod?: string;
  payoutNumber?: string;
  payoutName?: string;
  minPayoutAmount?: number;
}) => Promise<void>;

  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  initializeAuth: () => {
    const userCookie = getCookie('user');
    const token = localStorage.getItem('token') || getCookie('token');

    if (userCookie && token) {
      try {
        const user = JSON.parse(userCookie);
        console.log('initializeAuth - Restored user:', user);
        set({ user, token });
      } catch (e) {
        console.error('Failed to parse user cookie', e);
      }
    } else {
      console.log('initializeAuth - No user or token cookies found');
    }
  },

  // ============================================
  // LOGIN - Admin needs username, email, phone, password
  // ============================================
  login: async (email: string, password: string, role?: string, isAdmin?: boolean, username?: string, phone?: string) => {
    set({ isLoading: true, error: null });
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://dimbopbakedfiles.onrender.com';
      
      const loginPayload: any = {
        email,
        password,
        authProvider: 'email'
      };
      
      if (isAdmin || role === 'agent' ) {
        if (username) loginPayload.username = username;
        if (phone) loginPayload.phone = phone;
      }
      
      if (role) {
        loginPayload.role = role;
      }
      
      console.log('Login payload:', loginPayload);
      
      const response = await fetch(`${baseURL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginPayload),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Login - Response:', data);
      
      const user = data.data?.user || data.user;
      const token = data.data?.token || data.token;
      
      if (!user || !token) {
        throw new Error('Invalid response format from server');
      }
      
      localStorage.setItem('token', token);
      setCookie('user', JSON.stringify(user), 15);
      setCookie('token', token, 15);
      
      set({ user, token, isLoading: false });
      toast.success('Login successful');
    } catch (error: unknown) {
      const errorMessage = isApiError(error)
        ? error.message
        : error instanceof Error
        ? error.message
        : 'An unknown error occurred';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  // ============================================
  // REGISTER - Only for client and client_admin
  // ============================================
  // register: async (userData) => {
  //   set({ isLoading: true, error: null });

  //   const isClientAdmin = userData.role === 'client_admin';
  //   const isAgent = userData.role === 'agent'; // ✅ Agent registration check
  //   const endpoint = isClientAdmin 
  //      ? '/api/auth/register/client-admin'
  //     : isAgent
  //     ? '/api/agents/register' // ✅ Agent endpoint
  //     : '/api/auth/register/client';

  //   let apiData: any = {
  //     email: userData.email,
  //     phone: userData.phone,
  //     role: userData.role,
  //   };

  //   if (isClientAdmin) {
  //     apiData = {
  //       ...apiData,
  //       merchantName: userData.username || userData.name,
  //       physicalAddress: userData.phone,
  //       geoLocation: {
  //         latitude: -17.8252,
  //         longitude: 31.0335
  //       },
  //       authProvider: userData.authProvider || 'google',
  //       googleId: userData.googleId
  //     };
  //   }else if (isAgent) { // ✅ Agent registration data
  //     apiData = {
  //       ...apiData,
  //       name: userData.name || userData.username,
  //       authProvider: userData.authProvider || 'email',
  //       password: userData.password,
  //       confirmPassword: userData.confirmpassword
  //     };
  //     if (userData.googleId) apiData.googleId = userData.googleId;
  //     if (userData.appleId) apiData.appleId = userData.appleId;
  //     if (userData.facebookId) apiData.facebookId = userData.facebookId;
  //   } else {
  //     apiData = {
  //       ...apiData,
  //       name: userData.name || userData.username,
  //       authProvider: userData.authProvider || 'email',
  //       password: userData.password,
  //       confirmPassword: userData.confirmpassword
  //     };
      
  //     if (userData.googleId) apiData.googleId = userData.googleId;
  //     if (userData.appleId) apiData.appleId = userData.appleId;
  //     if (userData.facebookId) apiData.facebookId = userData.facebookId;
  //   }

  //   try {
  //     const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://dimbopbakedfiles.onrender.com';
  //     const response = await fetch(`${baseURL}${endpoint}`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(apiData),
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       const errorMessage = data.message || data.error || 'Registration failed';
  //       throw new Error(errorMessage);
  //     }

  //     const user = data.user || data.data?.user;
  //     const token = data.token || data.data?.token;

  //     if (!user || !token) {
  //       throw new Error('Invalid response format from server');
  //     }

  //     localStorage.setItem('token', token);
  //     setCookie('user', JSON.stringify(user), 15);
  //     setCookie('token', token, 15);

  //     set({ user, token, isLoading: false });
  //     toast.success('Registration successful');
  //   } catch (error: unknown) {
  //     const errorMessage = error instanceof Error 
  //       ? error.message 
  //       : 'Registration failed';
      
  //     console.error('Registration error:', error);
  //     set({ error: errorMessage, isLoading: false });
  //     toast.error(errorMessage);
  //     throw error;
  //   }
  // },

//   register: async (userData) => {
//   set({ isLoading: true, error: null });

//   const isClientAdmin = userData.role === 'client_admin';
//   const isAgent = userData.role === 'agent';
//   const endpoint = isClientAdmin 
//      ? '/api/auth/register/client-admin'
//     : isAgent
//     ? '/api/agents/register-new'
//     : '/api/auth/register/client';

//   console.log('🔍 Registration endpoint:', endpoint);
//   console.log('🔍 User data role:', userData.role);

//   let apiData: any = {
//     email: userData.email,
//     phone: userData.phone,
//     role: userData.role,
//   };

//   if (isClientAdmin) {
//     apiData = {
//       ...apiData,
//       merchantName: userData.username || userData.name,
//       physicalAddress: userData.phone,
//       geoLocation: {
//         latitude: -17.8252,
//         longitude: 31.0335
//       },
//       authProvider: userData.authProvider || 'google',
//       googleId: userData.googleId
//     };
//   } else if (isAgent) {
//     apiData = {
//       ...apiData,
//       name: userData.name || userData.username,
//       authProvider: userData.authProvider || 'email',
//       password: userData.password,
//       confirmPassword: userData.confirmpassword
//     };
//     if (userData.googleId) apiData.googleId = userData.googleId;
//     if (userData.appleId) apiData.appleId = userData.appleId;
//     if (userData.facebookId) apiData.facebookId = userData.facebookId;
//   } else {
//     apiData = {
//       ...apiData,
//       name: userData.name || userData.username,
//       authProvider: userData.authProvider || 'email',
//       password: userData.password,
//       confirmPassword: userData.confirmpassword
//     };
    
//     if (userData.googleId) apiData.googleId = userData.googleId;
//     if (userData.appleId) apiData.appleId = userData.appleId;
//     if (userData.facebookId) apiData.facebookId = userData.facebookId;
//   }

//   try {
//     const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://dimbopbakedfiles.onrender.com';
//     const fullURL = `${baseURL}${endpoint}`;
    
//     console.log('🔍 Full URL:', fullURL);
//     console.log('🔍 Request body:', JSON.stringify(apiData, null, 2));

//     const response = await fetch(fullURL, {
//       method: 'POST',
//       headers: { 
//         'Content-Type': 'application/json'
//         // NO Authorization header here!
//       },
//       body: JSON.stringify(apiData),
//     });

//     console.log('🔍 Response status:', response.status);
//     console.log('🔍 Response ok:', response.ok);

//     const data = await response.json();
//     console.log('🔍 Response data:', data);

//     if (!response.ok) {
//       const errorMessage = data.message || data.error || 'Registration failed';
//       console.error('❌ Registration failed:', errorMessage);
//       throw new Error(errorMessage);
//     }

//     const user = data.user || data.data?.user;
//     const token = data.token || data.data?.token;

//     if (!user || !token) {
//       console.error('❌ Invalid response - missing user or token');
//       throw new Error('Invalid response format from server');
//     }

//     console.log('✅ Registration successful!');
//     localStorage.setItem('token', token);
//     setCookie('user', JSON.stringify(user), 15);
//     setCookie('token', token, 15);

//     set({ user, token, isLoading: false });
//     toast.success('Registration successful');
//   } catch (error: unknown) {
//     const errorMessage = error instanceof Error 
//       ? error.message 
//       : 'Registration failed';
    
//     console.error('❌ Registration error:', error);
//     set({ error: errorMessage, isLoading: false });
//     toast.error(errorMessage);
//     throw error;
//   }
// },

register: async (userData) => {
  set({ isLoading: true, error: null });

  const isClientAdmin = userData.role === 'client_admin';
  const isAgent = userData.role === 'agent';
  const endpoint = isClientAdmin 
     ? '/api/auth/register/client-admin'
    : isAgent
    ? '/api/agents/register-new'
    : '/api/auth/register/client';

  console.log('🔍 Registration endpoint:', endpoint);
  console.log('🔍 User data role:', userData.role);

  let apiData: any = {
    email: userData.email,
    phone: userData.phone,
    role: userData.role,
  };

  if (isClientAdmin) {
    apiData = {
      ...apiData,
      merchantName: userData.username || userData.name,
      physicalAddress: userData.phone,
      geoLocation: {
        latitude: -17.8252,
        longitude: 31.0335
      },
      authProvider: userData.authProvider || 'google',
      googleId: userData.googleId
    };
  } else if (isAgent) {
    // ✅ FIXED: Include ALL agent-specific fields
    apiData = {
      ...apiData,
      name: userData.name || userData.username,
      authProvider: userData.authProvider || 'email',
      password: userData.password,
      confirmPassword: userData.confirmpassword,
      // Add all agent-specific fields from Register component
      commissionRate: userData.commissionRate,
      payoutMethod: userData.payoutMethod,
      payoutNumber: userData.payoutNumber,
      payoutName: userData.payoutName || userData.name || userData.username,
      minPayoutAmount: userData.minPayoutAmount || 10
    };
    
    // Add OAuth IDs if present
    if (userData.googleId) apiData.googleId = userData.googleId;
    if (userData.appleId) apiData.appleId = userData.appleId;
    if (userData.facebookId) apiData.facebookId = userData.facebookId;
  } else {
    // Regular client registration
    apiData = {
      ...apiData,
      name: userData.name || userData.username,
      authProvider: userData.authProvider || 'email',
      password: userData.password,
      confirmPassword: userData.confirmpassword
    };
    
    if (userData.googleId) apiData.googleId = userData.googleId;
    if (userData.appleId) apiData.appleId = userData.appleId;
    if (userData.facebookId) apiData.facebookId = userData.facebookId;
  }

  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://dimbopbakedfiles.onrender.com';
    const fullURL = `${baseURL}${endpoint}`;
    
    console.log('🔍 Full URL:', fullURL);
    console.log('🔍 Request body:', JSON.stringify(apiData, null, 2));

    const response = await fetch(fullURL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiData),
    });

    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response ok:', response.ok);

    const data = await response.json();
    console.log('🔍 Response data:', data);

    if (!response.ok) {
      const errorMessage = data.message || data.error || 'Registration failed';
      console.error('❌ Registration failed:', errorMessage);
      throw new Error(errorMessage);
    }

    const user = data.user || data.data?.user;
    const token = data.token || data.data?.token;

    if (!user || !token) {
      console.error('❌ Invalid response - missing user or token');
      throw new Error('Invalid response format from server');
    }

    console.log('✅ Registration successful!');
    localStorage.setItem('token', token);
    setCookie('user', JSON.stringify(user), 15);
    setCookie('token', token, 15);

    set({ user, token, isLoading: false });
    toast.success('Registration successful');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Registration failed';
    
    console.error('❌ Registration error:', error);
    set({ error: errorMessage, isLoading: false });
    toast.error(errorMessage);
    throw error;
  }
},

  logout: () => {
    set({ user: null, token: null });
    deleteCookie('user');
    deleteCookie('token');
    localStorage.removeItem('token');
    toast.success('Logged out successfully.');
  },

  clearError: () => set({ error: null }),
}));