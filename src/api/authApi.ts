import { LoginSchema, AuthResponse } from '@/lib/schemas/auth/login';
import { ClientRegisterInput, ClientAdminRegisterInput, AuthRegisterResponse,  AgentRegisterInput } from '@/lib/schemas/auth/register';
 
import axios from "axios";
import { apiClient } from "@/context/axios";

// ============================================
// LOGIN API
// ============================================
export const loginApi = async (data: LoginSchema): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/api/auth/login', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.message ||
        (typeof backendError === 'string' ? backendError : null) ||
        'Login failed';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

// ============================================
// CLIENT (CUSTOMER) REGISTRATION API
// ============================================
export const registerClientApi = async (data: ClientRegisterInput): Promise<AuthRegisterResponse> => {
  try {
    const response = await apiClient.post('/api/auth/register/client', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendErrorMessage = error.response?.data?.message || 
                                 error.response?.data?.error ||
                                 error.response?.data ||
                                 'Registration failed';
      throw new Error(backendErrorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

// ============================================
// CLIENT ADMIN (MERCHANT) REGISTRATION API
// ============================================
export const registerClientAdminApi = async (data: ClientAdminRegisterInput): Promise<AuthRegisterResponse> => {
  try {
    const response = await apiClient.post('/api/auth/register/client-admin', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendErrorMessage = error.response?.data?.message || 
                                 error.response?.data?.error ||
                                 error.response?.data ||
                                 'Registration failed';
      throw new Error(backendErrorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

// ============================================
// OTP APIs
// ============================================
export const requestOTPApi = async (data: { email: string; purpose: 'registration' | 'login' | 'verification' }) => {
  try {
    const response = await apiClient.post('/api/auth/otp/request', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to send OTP');
    }
    throw new Error('An unexpected error occurred');
  }
};

export const verifyOTPApi = async (data: { email: string; otp: string }) => {
  try {
    const response = await apiClient.post('/api/auth/otp/verify', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'OTP verification failed');
    }
    throw new Error('An unexpected error occurred');
  }
};

// ============================================
// PASSWORD MANAGEMENT APIs (unchanged)
// ============================================
export const ChangePasswordApi = async (data: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}) => {
  try {
    const response = await apiClient.post('/api/auth/change-password', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.message ||
        (typeof backendError === 'string' ? backendError : null) ||
        'Password change failed';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const ResetPasswordApi = async (data: {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}) => {
  try {
    const response = await apiClient.post('/api/auth/reset-password', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.message ||
        (typeof backendError === 'string' ? backendError : null) ||
        'Password reset failed';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const ForgetPasswordApi = async (data: { email: string }) => {
  try {
    const response = await apiClient.post('/api/auth/forgot-password', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.message ||
        (typeof backendError === 'string' ? backendError : null) ||
        'Password reset failed';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const DeleteApi = async (userId: string) => {
  try {
    const response = await apiClient.delete(`/api/auth/users/${userId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.message ||
        (typeof backendError === 'string' ? backendError : null) ||
        'Deletion failed';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};





// ============================================
// AGENT REGISTRATION & ACTIONS
// ============================================
export const registerAgentApi = async (data: AgentRegisterInput): Promise<AuthRegisterResponse> => {
  try {
    const response = await apiClient.post('/api/agents/register-new', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data ||
        'Agent registration failed'
      );
    }
    throw new Error('An unexpected error occurred');
  }
};

export const getAgentStatsApi = async () => {
  try {
    const response = await apiClient.get('/api/agents/my-stats');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to get agent stats');
    }
    throw new Error('An unexpected error occurred');
  }
};

export const recordAgentSaleApi = async (data: { orderId: number; agentCode: string }) => {
  try {
    const response = await apiClient.post('/api/agents/record-sale', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to record sale');
    }
    throw new Error('An unexpected error occurred');
  }
};

// ============================================
// ADMIN AGENT ROUTES
// ============================================
export const getAllAgentsApi = async () => {
  try {
    const response = await apiClient.get('/api/agents/all');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to get agents');
    }
    throw new Error('An unexpected error occurred');
  }
};

export const approveCommissionApi = async (saleId: number) => {
  try {
    const response = await apiClient.post(`/api/agents/sales/${saleId}/approve`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to approve commission');
    }
    throw new Error('An unexpected error occurred');
  }
};

export const createPayoutApi = async (data: {
  agentId: number;
  amount: number;
  paymentMethod: string;
  paymentReference?: string;
  payoutAccount?: string;
  fromDate: string;
  toDate: string;
}) => {
  try {
    const response = await apiClient.post('/api/agents/payouts/create', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create payout');
    }
    throw new Error('An unexpected error occurred');
  }
};

export const completePayoutApi = async (payoutId: number) => {
  try {
    const response = await apiClient.post(`/api/agents/payouts/${payoutId}/complete`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to complete payout');
    }
    throw new Error('An unexpected error occurred');
  }
};

export const getPendingPayoutsApi = async () => {
  try {
    const response = await apiClient.get('/api/agents/payouts/pending');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to get pending payouts');
    }
    throw new Error('An unexpected error occurred');
  }
};


