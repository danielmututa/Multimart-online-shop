import axios from "axios";
import { apiClient } from "@/context/axios";
import { BusinessDocument, UploadDocumentInput } from "@/lib/schemas/documents/businessDocuments";

// Upload business document
export const uploadBusinessDocument = async (file: File, data: UploadDocumentInput): Promise<BusinessDocument> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', data.documentType);
    if (data.productId) formData.append('productId', data.productId.toString());
    if (data.expiresAt) formData.append('expiresAt', data.expiresAt);

    const response = await apiClient.post('/api/business-documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to upload document');
    }
    throw new Error('An unexpected error occurred');
  }
};

// Get my documents (for client_admin)
export const getMyDocuments = async (): Promise<BusinessDocument[]> => {
  try {
    const response = await apiClient.get('/api/business-documents/my-documents');
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch documents');
    }
    throw new Error('An unexpected error occurred');
  }
};

// Get pending documents (for super_admin)
export const getPendingDocuments = async (): Promise<BusinessDocument[]> => {
  try {
    const response = await apiClient.get('/api/business-documents/pending');
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch pending documents');
    }
    throw new Error('An unexpected error occurred');
  }
};

// Approve document (super_admin only)
export const approveDocument = async (documentId: number): Promise<BusinessDocument> => {
  try {
    const response = await apiClient.post(`/api/business-documents/${documentId}/approve`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to approve document');
    }
    throw new Error('An unexpected error occurred');
  }
};

// Reject document (super_admin only)
export const rejectDocument = async (documentId: number, rejectionReason: string): Promise<BusinessDocument> => {
  try {
    const response = await apiClient.post(`/api/business-documents/${documentId}/reject`, {
      rejectionReason
    });
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to reject document');
    }
    throw new Error('An unexpected error occurred');
  }
};

// Delete document
export const deleteDocument = async (documentId: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/business-documents/${documentId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to delete document');
    }
    throw new Error('An unexpected error occurred');
  }
};