
import axios from "axios";
import { apiClient } from "@/context/axios";
import {  ProductSM,ProductsSM } from "@/lib/schemas/products/Products";
import { Review,  ReviewComment,  } from "@/lib/schemas/feedback/feedback";

export const CreateProduct = async (data: ProductSM) : Promise<ProductsSM>=> {
  try {
    const response = await apiClient.post('/api/products/newproduct', data);
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


export const GetProducts = async () : Promise<ProductsSM>=> {
  try {
    const response = await apiClient.get('/api/products');
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




export const GetProductById = async (id: string) : Promise<ProductSM>=> {
  try {
    const response = await apiClient.get(`/api/products/${id}`);
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

export const UpdateProduct = async (id: string, data: ProductSM) : Promise<ProductSM>=> {
  try {
    const response = await apiClient.put(`/api/products/${id}`, data);
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



export const DeleteProduct = async (id: string) : Promise<ProductSM>=> {
  try {
    const response = await apiClient.delete(`/api/products/${id}`);
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



// Updated API functions to match backend schema expectations

export const AddReview = async (
  productId: string | number,
  data: { user_id: number; rating: number; comment: string; username?: string }
): Promise<Review> => {
  try {
    if (!data.user_id) {
      throw new Error('User ID is required');
    }
    
    if (!data.comment?.trim()) {
      throw new Error('Comment is required');
    }
    
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const response = await apiClient.post(`/api/products/${productId}/reviews`, {
      user_id: data.user_id,
      rating: data.rating,
      comment: data.comment.trim(),
      username: data.username || "Anonymous" // ✅ Changed from user_name to username
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage = backendError?.message || 
                          (typeof backendError === 'string' ? backendError : null) ||
                          'Review creation failed';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const AddReviewComment = async (
  reviewId: string | number,
  data: { user_id?: number; comment: string; username?: string }
): Promise<ReviewComment> => {
  try {
    const response = await apiClient.post(`/api/products/reviews/${reviewId}/comments`, {
      user_id: data.user_id,
      comment: data.comment,
      username: data.username || "Anonymous" // ✅ Using username to match backend
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage = backendError?.message || 'Failed to add comment';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const TrackProductView = async (
  productId: string | number,
  data?: { user_id?: number; username?: string }
): Promise<void> => {
  try {
    await apiClient.post(`/api/products/${productId}/view`, {
      user_id: data?.user_id,
      username: data?.username || "Anonymous" // ✅ Using username to match backend
    });
  } catch (error) {
    // Silently fail for view tracking
    console.error('Error tracking product view:', error);
  }
};

// Keep all other functions the same
export const GetReviews = async (productId: string | number): Promise<Review[]> => {
  try {
    const response = await apiClient.get(`/api/products/${productId}/reviews`);
    return response.data || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      let errorMessage = 'Failed to fetch reviews';
      
      if (typeof backendError === 'string') {
        errorMessage = backendError;
      } else if (backendError?.message) {
        errorMessage = backendError.message;
      }

      if (error.response?.status === 404) {
        errorMessage = 'Product not found';
      }

      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred while fetching reviews');
  }
};

export const DeleteReview = async (
  reviewId: string | number,
  userId?: number
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete(`/api/products/reviews/${reviewId}`, {
      data: { user_id: userId }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage = backendError?.message || 
                          (typeof backendError === 'string' ? backendError : null) || 
                          'Failed to delete review';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred while deleting the review');
  }
};

export const ToggleReviewLike = async (
  reviewId: string | number,
  userId: number,
  isLike: boolean
): Promise<any> => {
  try {
    const response = await apiClient.post(`/api/products/reviews/${reviewId}/like`, {
      user_id: userId,
      is_like: isLike
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage = backendError?.message || 'Failed to toggle like';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const GetReviewLikeStatus = async (
  reviewId: string | number,
  userId: number
): Promise<boolean | null> => {
  try {
    const response = await apiClient.get(`/api/products/reviews/${reviewId}/like-status?user_id=${userId}`);
    return response.data.like_status;
  } catch (error) {
    console.error('Error getting like status:', error);
    return null;
  }
};

export const GetReviewComments = async (reviewId: string | number): Promise<ReviewComment[]> => {
  try {
    const response = await apiClient.get(`/api/products/reviews/${reviewId}/comments`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching review comments:', error);
    return [];
  }
};

export const DeleteReviewComment = async (
  commentId: string | number,
  userId?: number
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete(`/api/products/review-comments/${commentId}`, {
      data: { user_id: userId }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data;
      const errorMessage = backendError?.message || 'Failed to delete comment';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const GetProductViewStats = async (
  productId: string | number
): Promise<{
  total_views: number;
  unique_users: number;
  today_views: number;
  week_views: number;
}> => {
  try {
    const response = await apiClient.get(`/api/products/${productId}/views`);
    return response.data;
  } catch (error) {
    console.error('Error getting view stats:', error);
    return { total_views: 0, unique_users: 0, today_views: 0, week_views: 0 };
  }
};

export const GetProductWithViews = async (
  productId: string | number
): Promise<ProductSM | null> => {
  try {
    const response = await apiClient.get(`/api/products/${productId}/with-views`);
    return response.data;
  } catch (error) {
    console.error('Error getting product with views:', error);
    return null;
  }
};