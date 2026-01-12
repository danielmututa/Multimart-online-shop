
// productAgentsApi.ts
import axios from "axios";
import { apiClient } from "@/context/axios";
import {
  ProductAgent,
  AgentApplication,
  AgentApplicationResponse,
  AgentReferralResponse,
  AgentStats,
} from "@/components/interfaces/productAgents";

// Helper function to extract data from backend response
const extractData = (response: any): any[] => {
  // Check for { success: true, data: [...], count: X } format
  if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  
  // Check for { data: [...] } format
  if (response && response.data && Array.isArray(response.data)) {
    return response.data;
  }
  
  // Return whatever we got
  return response.data || [];
};

// ============================================
// USER ROUTES - Client Side
// ============================================

export const ApplyAsProductAgent = async (
  data: AgentApplication
): Promise<AgentApplicationResponse> => {
  try {
    const response = await apiClient.post('/api/agentproduct/apply', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.message ||
        (typeof backendError === 'string' ? backendError : null) ||
        'Failed to submit agent application';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const GetMyAgentApplications = async (): Promise<ProductAgent[]> => {
  try {
    const response = await apiClient.get('/api/agentproduct/my-applications');
    return extractData(response);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.message ||
        (typeof backendError === 'string' ? backendError : null) ||
        'Failed to fetch applications';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const GenerateReferralLink = async (
  productId: number
): Promise<AgentReferralResponse> => {
  try {
    const response = await apiClient.post('/api/agentproduct/referral-link', {
      productId,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.message ||
        (typeof backendError === 'string' ? backendError : null) ||
        'Failed to generate referral link';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const GetAgentStats = async (agentId: number): Promise<AgentStats> => {
  try {
    const response = await apiClient.get(`/api/agentproduct/stats/${agentId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.message ||
        (typeof backendError === 'string' ? backendError : null) ||
        'Failed to fetch agent stats';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

// ============================================
// PUBLIC ROUTES
// ============================================

export const GetProductAgents = async (productId: number): Promise<ProductAgent[]> => {
  try {
    const response = await apiClient.get(`/api/agentproduct/product/${productId}`);
    return extractData(response);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.message ||
        (typeof backendError === 'string' ? backendError : null) ||
        'Failed to fetch product agents';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

// ============================================
// ADMIN ROUTES
// ============================================

export const GetPendingAgentApplications = async (): Promise<ProductAgent[]> => {
  try {
    const response = await apiClient.get('/api/agentproduct/pending');
    return extractData(response);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.message ||
        (typeof backendError === 'string' ? backendError : null) ||
        'Failed to fetch pending applications';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const GetAllAgentApplications = async (filters?: {
  status?: 'pending' | 'approved' | 'rejected';
  productId?: number;
}): Promise<ProductAgent[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.productId) params.append('productId', filters.productId.toString());
    
    const response = await apiClient.get(`/api/agentproduct/all?${params.toString()}`);
    return extractData(response);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.message ||
        (typeof backendError === 'string' ? backendError : null) ||
        'Failed to fetch applications';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const ApproveAgentApplication = async (
  agentId: number,
  commissionRate?: number
): Promise<{ success: boolean; message: string; data: ProductAgent }> => {
  try {
    const response = await apiClient.post(`/api/agentproduct/${agentId}/approve`, {
      commissionRate: commissionRate || 10
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.message ||
        (typeof backendError === 'string' ? backendError : null) ||
        'Failed to approve application';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const RejectAgentApplication = async (
  agentId: number,
  rejectionReason: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post(`/api/agentproduct/${agentId}/reject`, {
      rejectionReason
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.message ||
        (typeof backendError === 'string' ? backendError : null) ||
        'Failed to reject application';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

















// @/api/productAgentsApi.ts
// import axios from "axios";
// import { apiClient } from "@/context/axios";
// import {
//   ProductAgent,
//   AgentApplication,
//   AgentApplicationResponse,
//   AgentReferralResponse,
//   AgentStats,
// } from "@/components/interfaces/productAgents";

// // Helper function to extract data from backend response
// const extractData = (response: any): any[] => {
//   console.log('📡 Raw API response:', response);
  
//   // Check for { success: true, data: [...], count: X } format
//   if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
//     console.log('✅ Extracted data from response.data.data');
//     return response.data.data;
//   }
  
//   // Check for { data: [...] } format
//   if (response && response.data && Array.isArray(response.data)) {
//     console.log('✅ Extracted data from response.data');
//     return response.data;
//   }
  
//   // Return whatever we got
//   console.log('⚠️ Returning response.data as is');
//   return response.data || [];
// };

// // ============================================
// // USER ROUTES - Client Side
// // ============================================

// /**
//  * Apply to become an agent for a specific product
//  */
// export const ApplyAsProductAgent = async (
//   data: AgentApplication
// ): Promise<AgentApplicationResponse> => {
//   try {
//     const response = await apiClient.post('/api/agentproduct/apply', data);
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to submit agent application';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// /**
//  * Get current user's agent applications
//  */
// export const GetMyAgentApplications = async (): Promise<ProductAgent[]> => {
//   try {
//     const response = await apiClient.get('/api/agentproduct/my-applications');
//     return extractData(response);
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to fetch applications';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// /**
//  * Generate referral link for approved agent
//  */
// export const GenerateReferralLink = async (
//   productId: number
// ): Promise<AgentReferralResponse> => {
//   try {
//     const response = await apiClient.post('/api/agentproduct/referral-link', {
//       productId,
//     });
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to generate referral link';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// /**
//  * Get agent statistics
//  */
// export const GetAgentStats = async (agentId: number): Promise<AgentStats> => {
//   try {
//     const response = await apiClient.get(`/api/agentproduct/stats/${agentId}`);
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to fetch agent stats';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// // ============================================
// // PUBLIC ROUTES
// // ============================================

// /**
//  * Get all agents for a specific product
//  */
// export const GetProductAgents = async (productId: number): Promise<ProductAgent[]> => {
//   try {
//     const response = await apiClient.get(`/api/agentproduct/product/${productId}`);
//     return extractData(response);
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to fetch product agents';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// // ============================================
// // ADMIN ROUTES
// // ============================================

// /**
//  * Get all pending agent applications (Admin only)
//  */
// export const GetPendingAgentApplications = async (): Promise<ProductAgent[]> => {
//   try {
//     const response = await apiClient.get('/api/agentproduct/pending');
//     return extractData(response);
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to fetch pending applications';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// /**
//  * Get all agent applications with filters (Admin only)
//  */
// export const GetAllAgentApplications = async (filters?: {
//   status?: 'pending' | 'approved' | 'rejected';
//   productId?: number;
// }): Promise<ProductAgent[]> => {
//   try {
//     const params = new URLSearchParams();
//     if (filters?.status) params.append('status', filters.status);
//     if (filters?.productId) params.append('productId', filters.productId.toString());
    
//     const response = await apiClient.get(`/api/agentproduct/all?${params.toString()}`);
//     return extractData(response);
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to fetch applications';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// /**
//  * Approve agent application (Admin only)
//  */
// export const ApproveAgentApplication = async (
//   agentId: number,
//   commissionRate?: number
// ): Promise<{ success: boolean; message: string; data: ProductAgent }> => {
//   try {
//     const response = await apiClient.post(`/api/agentproduct/${agentId}/approve`, {
//       commissionRate: commissionRate || 10 // Default 10%
//     });
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to approve application';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// /**
//  * Reject agent application (Admin only)
//  */
// export const RejectAgentApplication = async (
//   agentId: number,
//   rejectionReason: string
// ): Promise<{ success: boolean; message: string }> => {
//   try {
//     const response = await apiClient.post(`/api/agentproduct/${agentId}/reject`, {
//       rejectionReason
//     });
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to reject application';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };









// import axios from "axios";
// import { apiClient } from "@/context/axios";
// import {
//   ProductAgent,
//   AgentApplication,
//   AgentApplicationResponse,
//   AgentReferralResponse,
//   AgentStats,
// } from "@/components/interfaces/productAgents";

// // ============================================
// // USER ROUTES - Client Side
// // ============================================

// /**
//  * Apply to become an agent for a specific product
//  */
// export const ApplyAsProductAgent = async (
//   data: AgentApplication
// ): Promise<AgentApplicationResponse> => {
//   try {
//     const response = await apiClient.post('/api/agentproduct/apply', data);
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to submit agent application';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// /**
//  * Get current user's agent applications
//  */
// export const GetMyAgentApplications = async (): Promise<ProductAgent[]> => {
//   try {
//     const response = await apiClient.get('/api/agentproduct/my-applications');
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to fetch applications';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// /**
//  * Generate referral link for approved agent
//  */
// export const GenerateReferralLink = async (
//   productId: number
// ): Promise<AgentReferralResponse> => {
//   try {
//     const response = await apiClient.post('/api/agentproduct/referral-link', {
//       productId,
//     });
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to generate referral link';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// /**
//  * Get agent statistics
//  */
// export const GetAgentStats = async (agentId: number): Promise<AgentStats> => {
//   try {
//     const response = await apiClient.get(`/api/agentproduct/stats/${agentId}`);
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to fetch agent stats';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// // ============================================
// // PUBLIC ROUTES
// // ============================================

// /**
//  * Get all agents for a specific product
//  */
// export const GetProductAgents = async (productId: number): Promise<ProductAgent[]> => {
//   try {
//     const response = await apiClient.get(`/api/agentproduct/product/${productId}`);
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to fetch product agents';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// // ============================================
// // ADMIN ROUTES
// // ============================================

// /**
//  * Get all pending agent applications (Admin only)
//  */
// export const GetPendingAgentApplications = async (): Promise<ProductAgent[]> => {
//   try {
//     const response = await apiClient.get('/api/agentproduct/pending');
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to fetch pending applications';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// /**
//  * Get all agent applications with filters (Admin only)
//  */
// export const GetAllAgentApplications = async (filters?: {
//   status?: 'pending' | 'approved' | 'rejected';
//   productId?: number;
// }): Promise<ProductAgent[]> => {
//   try {
//     const params = new URLSearchParams();
//     if (filters?.status) params.append('status', filters.status);
//     if (filters?.productId) params.append('productId', filters.productId.toString());
    
//     const response = await apiClient.get(`/api/agentproduct/all?${params.toString()}`);
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to fetch applications';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// /**
//  * Approve agent application (Admin only)
//  */
// export const ApproveAgentApplication = async (
//   agentId: number,
//   commissionRate?: number
// ): Promise<{ success: boolean; message: string; data: ProductAgent }> => {
//   try {
//     const response = await apiClient.post(`/api/agentproduct/${agentId}/approve`, {
//       commissionRate: commissionRate || 10 // Default 10%
//     });
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to approve application';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// /**
//  * Reject agent application (Admin only)
//  */
// export const RejectAgentApplication = async (
//   agentId: number,
//   rejectionReason: string
// ): Promise<{ success: boolean; message: string }> => {
//   try {
//     const response = await apiClient.post(`/api/agentproduct/${agentId}/reject`, {
//       rejectionReason
//     });
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to reject application';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };



















// import axios from "axios";
// import { apiClient } from "@/context/axios";
// import {
//   ProductAgent,
//   AgentApplication,
//   AgentApplicationResponse,
//   AgentReferralResponse,
//   AgentStats,
// } from "@/components/interfaces/productAgents";

// // ============================================
// // USER ROUTES - Client Side
// // ============================================

// /**
//  * Apply to become an agent for a specific product
//  */
// export const ApplyAsProductAgent = async (
//   data: AgentApplication
// ): Promise<AgentApplicationResponse> => {
//   try {
//     const response = await apiClient.post('/api/agentproduct/apply', data);
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to submit agent application';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// /**
//  * Get current user's agent applications
//  */
// export const GetMyAgentApplications = async (): Promise<ProductAgent[]> => {
//   try {
//     const response = await apiClient.get('/api/agentproduct/my-applications');
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to fetch applications';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// /**
//  * Generate referral link for approved agent
//  */
// export const GenerateReferralLink = async (
//   productId: number
// ): Promise<AgentReferralResponse> => {
//   try {
//     const response = await apiClient.post('/api/agentproduct/referral-link', {
//       productId,
//     });
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to generate referral link';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// /**
//  * Get agent statistics
//  */
// export const GetAgentStats = async (agentId: number): Promise<AgentStats> => {
//   try {
//     const response = await apiClient.get(`/api/agentproduct/stats/${agentId}`);
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to fetch agent stats';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };

// // ============================================
// // PUBLIC ROUTES
// // ============================================

// /**
//  * Get all agents for a specific product
//  */
// export const GetProductAgents = async (productId: number): Promise<ProductAgent[]> => {
//   try {
//     const response = await apiClient.get(`/api/agentproduct/product/${productId}`);
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const backendError = error.response?.data;
//       const errorMessage =
//         backendError?.message ||
//         (typeof backendError === 'string' ? backendError : null) ||
//         'Failed to fetch product agents';
//       throw new Error(errorMessage);
//     }
//     throw new Error('An unexpected error occurred');
//   }
// };