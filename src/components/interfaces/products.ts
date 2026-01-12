export interface Category {
    id: number;
    name: string;
  }
  
  // export interface Review {
  //   id: number;
  //   user_id: number;
  //   product_id: number;
  //   rating: number;
  //   comment: string;
  //   created_at: string;
  // }






  export interface User {
  id: number;
  username: string;
  email?: string; // Optional in some places
}

export interface ReviewLikeUser {
  id: number;
  username: string;
}

export interface ReviewLike {
  id?: number;
  is_like: boolean;
  users: ReviewLikeUser;
}

export interface ReviewCommentUser {
  id: number;
  username: string;
}

export interface ReviewComment {
  id?: number;
  user_id?: number;
  comment: string;
  username?: string;
  created_at?: string;
  users?: ReviewCommentUser;
}

export interface Review {
  id: number;
  user_id?: number;
  product_id: number;
  rating: number;
  comment: string;
  username?: string;
  created_at: string;
  users?: User;
  likes_count?: number;
  dislikes_count?: number;
  comments_count?: number;
  review_likes?: ReviewLike[];
  review_comments?: ReviewComment[];
}

export interface ReviewLikeSchema {
  user_id: number;
  is_like: boolean;
}

export interface ProductView {
  user_id?: number;
  ip_address?: string;
  user_agent?: string;
  username?: string;
}



  
  export interface CartItem {
    id: number;
    user_id: number | null;
    product_id: number;
    quantity: number;
    price: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    stock_quantity: number;
    category_id: number | null;
    image_url: string;
    created_at: string;
    updated_at: string;
    discount_percentage: number;
    views: number;
    categories: Category | null;
    reviews: Review[];
    cart: CartItem[];
    // order_items: OrderItem[];

     approval_status?: 'pending' | 'approved' | 'rejected';
  is_visible?: boolean;
  can_apply_as_agent?: boolean; // Helper flag
  }
  




