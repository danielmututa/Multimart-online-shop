import axios from 'axios';
import { apiClient } from '@/context/axios';
import { BlogPostSM, BlogResponseSM } from '@/lib/schemas/blogs/blog';

export const CreateBlog = async (data: FormData): Promise<BlogPostSM> => {
  try {
    const response = await apiClient.post('/api/blogs/newblog', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.message ||
        (typeof backendError === 'string' ? backendError : null) ||
        'Failed to create blog';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const GetBlogs = async (page?: number, limit?: number, authorId?: number): Promise<BlogResponseSM> => {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (authorId) params.append('authorId', authorId.toString());
    
    const response = await apiClient.get(`/api/blogs?${params.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.message ||
        (typeof backendError === 'string' ? backendError : null) ||
        'Failed to fetch blogs';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const GetBlogById = async (id: string): Promise<BlogPostSM> => {
  try {
    const response = await apiClient.get(`/api/blogs/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.message ||
        (typeof backendError === 'string' ? backendError : null) ||
        'Failed to fetch blog';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const UpdateBlog = async (id: string, data: FormData): Promise<BlogPostSM> => {
  try {
    const response = await apiClient.put(`/api/blogs/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.message ||
        (typeof backendError === 'string' ? backendError : null) ||
        'Failed to update blog';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};



export const DeleteBlog = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/blogs/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage =
        backendError?.message ||
        (typeof backendError === 'string' ? backendError : null) ||
        'Failed to delete blog';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};