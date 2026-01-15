// src/api/subscriptionApi.ts
import axios from "axios";
import { apiClient } from "@/context/axios";
import {
  PaymentProof,
  ActivationPaymentData,
  SubscriptionPaymentData,
  MerchantSubscription,
  PendingPaymentsResponse,
  PaymentResponse,
  SubscriptionResponse,
  ProcessPaymentRequest,
  ApprovalItem,
  ApprovalResponse,
  ProcessApprovalRequest
} from "@/components/interfaces/subscription";

// ============================================
// MERCHANT ROUTES (Client Admin)
// ============================================

// Submit activation payment ($1)
export const submitActivationPayment = async (
  data: ActivationPaymentData
): Promise<PaymentResponse> => {
  const formData = new FormData();
  
  formData.append('paymentMethod', data.paymentMethod);
  formData.append('phoneNumber', data.phoneNumber);
  formData.append('transactionReference', data.transactionReference);
  formData.append('amount', data.amount.toString());
  
  if (data.paymentProof) {
    formData.append('paymentProof', data.paymentProof);
  }
  
  try {
    const response = await apiClient.post('/api/v1/activation/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.error ||
        backendError?.message ||
        'Failed to submit activation payment';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

// Submit subscription plan payment
export const submitSubscriptionPayment = async (
  data: SubscriptionPaymentData
): Promise<PaymentResponse> => {
  const formData = new FormData();
  
  formData.append('planType', data.planType);
  formData.append('paymentMethod', data.paymentMethod);
  formData.append('phoneNumber', data.phoneNumber);
  formData.append('transactionReference', data.transactionReference);
  
  if (data.paymentProof) {
    formData.append('paymentProof', data.paymentProof);
  }
  
  try {
    const response = await apiClient.post('/api/v1/subscription/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.error ||
        backendError?.message ||
        'Failed to submit subscription payment';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

// Get merchant's subscription status
export const getMySubscription = async (): Promise<MerchantSubscription> => {
  try {
    const response = await apiClient.get('/api/v1/subscription/me');
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.error ||
        backendError?.message ||
        'Failed to fetch subscription status';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

// ============================================
// ADMIN ROUTES - PAYMENTS
// ============================================

// Get all pending payments (admin only)
export const getPendingPayments = async (): Promise<PaymentProof[]> => {
  try {
    const response = await apiClient.get('/api/v1/payments/pending');
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.error ||
        backendError?.message ||
        'Failed to fetch pending payments';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

// Approve/Reject payment (admin only)
export const processPayment = async (
  data: ProcessPaymentRequest
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post('/api/v1/payments/process', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.error ||
        backendError?.message ||
        'Failed to process payment';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

// ============================================
// ADMIN ROUTES - APPROVALS
// ============================================

// Get all pending approvals (admin only)
export const getPendingApprovals = async (): Promise<ApprovalItem[]> => {
  try {
    const response = await apiClient.get('/api/v1/approvals/pending');
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.error ||
        backendError?.message ||
        'Failed to fetch pending approvals';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

// Get all approvals (admin only)
export const getAllApprovals = async (): Promise<ApprovalItem[]> => {
  try {
    const response = await apiClient.get('/api/v1/approvals/all');
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.error ||
        backendError?.message ||
        'Failed to fetch approvals';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

// Process approval (approve/reject) (admin only)
export const processApproval = async (
  data: ProcessApprovalRequest
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post('/api/v1/approvals/process', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.error ||
        backendError?.message ||
        'Failed to process approval';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

// Get approval statistics (admin only)
export const getApprovalStats = async (): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byType: { blog: number; product: number };
}> => {
  try {
    const response = await apiClient.get('/api/v1/approvals/stats');
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.error ||
        backendError?.message ||
        'Failed to fetch approval statistics';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};











// // src/api/subscriptionApi.ts
// import axios from "axios";
// import { apiClient } from "@/context/axios";
// import {
//   PaymentProof,
//   ActivationPaymentData,
//   SubscriptionPaymentData,
//   MerchantSubscription,
//   PendingPaymentsResponse,
//   PaymentResponse,
//   SubscriptionResponse,
//   ProcessPaymentRequest
// } from "@/components/interfaces/subscription";

// // ============================================
// // MERCHANT ROUTES (Client Admin)
// // ============================================

// // Submit activation payment ($1)
// export const submitActivationPayment = async (
//   data: ActivationPaymentData
// ): Promise<PaymentResponse> => {
//   const formData = new FormData();
  
//   formData.append('paymentMethod', data.paymentMethod);
//   formData.append('phoneNumber', data.phoneNumber);
//   formData.append('transactionReference', data.transactionReference);
//   formData.append('amount', data.amount.toString());
  
//   if (data.paymentProof) {
//     formData.append('paymentProof', data.paymentProof);
//   }
  
//   try {
//     const response = await apiClient.post('/api/subscriptions/activation/submit', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.error ||
//         backendError?.message ||
//         'Failed to submit activation payment';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// // Submit subscription plan payment
// export const submitSubscriptionPayment = async (
//   data: SubscriptionPaymentData
// ): Promise<PaymentResponse> => {
//   const formData = new FormData();
  
//   formData.append('planType', data.planType);
//   formData.append('paymentMethod', data.paymentMethod);
//   formData.append('phoneNumber', data.phoneNumber);
//   formData.append('transactionReference', data.transactionReference);
  
//   if (data.paymentProof) {
//     formData.append('paymentProof', data.paymentProof);
//   }
  
//   try {
//     const response = await apiClient.post('/api/subscriptions/subscription/submit', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.error ||
//         backendError?.message ||
//         'Failed to submit subscription payment';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// // Get merchant's subscription status
// export const getMySubscription = async (): Promise<MerchantSubscription> => {
//   try {
//     const response = await apiClient.get('/api/subscriptions/subscription/me');
//     return response.data.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.error ||
//         backendError?.message ||
//         'Failed to fetch subscription status';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// // ============================================
// // ADMIN ROUTES
// // ============================================

// // Get all pending payments (admin only)
// export const getPendingPayments = async (): Promise<PaymentProof[]> => {
//   try {
//     const response = await apiClient.get('/api/subscriptions/payments/pending');
//     return response.data.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.error ||
//         backendError?.message ||
//         'Failed to fetch pending payments';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// // Approve/Reject payment (admin only)
// export const processPayment = async (
//   data: ProcessPaymentRequest
// ): Promise<{ success: boolean; message: string }> => {
//   try {
//     const response = await apiClient.post('/api/subscriptions/payments/process', data);
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.error ||
//         backendError?.message ||
//         'Failed to process payment';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };







// // API functions for approval system
// export const getPendingApprovals = async (): Promise<ApprovalItem[]> => {
//   try {
//     const response = await apiClient.get('/api/admin/approvals/pending');
//     return response.data.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       throw new Error(backendError?.error || 'Failed to fetch pending approvals');
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// export const getAllApprovals = async (): Promise<ApprovalItem[]> => {
//   try {
//     const response = await apiClient.get('/api/admin/approvals/all');
//     return response.data.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       throw new Error(backendError?.error || 'Failed to fetch approvals');
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// export const processApproval = async (
//   data: ProcessApprovalRequest
// ): Promise<{ success: boolean; message: string }> => {
//   try {
//     const response = await apiClient.post('/api/admin/approvals/process', data);
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       throw new Error(backendError?.error || 'Failed to process approval');
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };