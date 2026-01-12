// import { apiClient } from "@/context/axios";
// import type { ProductSM, ProductApprovalRequest, PendingProductsResponse } from "@/lib/schemas/products/Products";

// // Get pending products
// export const getPendingProductsApi = async (): Promise<PendingProductsResponse> => {
//   try {
//     const response = await apiClient.get('/api/products/pending');
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching pending products:', error);
//     throw error;
//   }
// };

// // Get overdue products
// export const getOverdueProductsApi = async (): Promise<PendingProductsResponse> => {
//   try {
//     const response = await apiClient.get('/api/products/overdue');
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching overdue products:', error);
//     throw error;
//   }
// };

// // Approve or reject a product using ProductApprovalRequest
// export const handleProductApprovalApi = async (
//   request: ProductApprovalRequest
// ): Promise<{ success: boolean; data: ProductSM }> => {
//   const { productId, action, rejectionReason } = request;

//   try {
//     const response = await apiClient.post(`/api/products/${productId}/${action}`, {
//       rejectionReason, // will be undefined if action is 'approve'
//     });
//     return response.data;
//   } catch (error) {
//     console.error(`Error ${action}ing product:`, error);
//     throw error;
//   }
// };

// // Get my products (for client_admin)
// export const getMyProductsApi = async (): Promise<{ success: boolean; data: ProductSM[] }> => {
//   try {
//     const response = await apiClient.get('/api/products/my-products');
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching my products:', error);
//     throw error;
//   }
// };
