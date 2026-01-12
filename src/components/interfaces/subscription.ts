// // src/components/interfaces/subscription.ts

// // Payment proof interface
// export interface PaymentProof {
//   id: number;
//   user_id: number;
//   payment_type: 'activation' | 'subscription';
//   plan_type?: '3_months' | '6_months' | '1_year' | '1_month_trial';
//   payment_method: 'ecocash' | 'bank' | 'paynow' | 'onemoney' | 'telecash';
//   phone_number?: string;
//   transaction_reference: string;
//   amount: number;
//   payment_proof_url?: string;
//   status: 'pending' | 'approved' | 'rejected';
//   rejection_reason?: string;
//   approved_by?: number;
//   approved_at?: string;
//   created_at: string;
//   users?: {
//     id: number;
//     merchant_name: string;
//     email: string;
//     phone?: string;
//   };
// }

// // Subscription interface
// export interface Subscription {
//   id: number;
//   user_id: number;
//   plan_type: '3_months' | '6_months' | '1_year' | '1_month_trial';
//   start_date: string;
//   end_date: string;
//   is_active: boolean;
//   is_trial: boolean;
//   created_at: string;
// }

// // Merchant subscription status
// export interface MerchantSubscription {
//   subscription_status: 'inactive' | 'trial' | 'active' | 'suspended';
//   trial_ends_at?: string;
//   currentSubscription?: Subscription;
// }

// // Activation payment data
// export interface ActivationPaymentData {
//   paymentMethod: string;
//   phoneNumber: string;
//   transactionReference: string;
//   amount: number;
//   paymentProof?: File;
// }

// // Subscription payment data
// export interface SubscriptionPaymentData {
//   planType: '3_months' | '6_months' | '1_year';
//   paymentMethod: string;
//   phoneNumber: string;
//   transactionReference: string;
//   paymentProof?: File;
// }

// // API Responses
// export interface PaymentResponse {
//   success: boolean;
//   message: string;
//   data: PaymentProof;
// }

// export interface SubscriptionResponse {
//   success: boolean;
//   data: MerchantSubscription;
// }

// export interface PendingPaymentsResponse {
//   success: boolean;
//   data: PaymentProof[];
// }

// export interface ProcessPaymentRequest {
//   paymentId: number;
//   action: 'approve' | 'reject';
//   rejectionReason?: string;
// }

// // Subscription plans constants
// export const SUBSCRIPTION_PLANS = {
//   '3_months': { name: '3 Months', price: 50, duration: 90 },
//   '6_months': { name: '6 Months', price: 90, duration: 180 },
//   '1_year': { name: '1 Year', price: 150, duration: 365 }
// } as const;














// src/components/interfaces/subscription.ts

// ============================================
// PAYMENT & SUBSCRIPTION INTERFACES
// ============================================

// Payment proof interface
export interface PaymentProof {
  id: number;
  user_id: number;
  payment_type: 'activation' | 'subscription';
  plan_type?: '3_months' | '6_months' | '1_year' | '1_month_trial';
  payment_method: 'ecocash' | 'bank' | 'paynow' | 'onemoney' | 'telecash';
  phone_number?: string;
  transaction_reference: string;
  amount: number;
  payment_proof_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  approved_by?: number;
  approved_at?: string;
  created_at: string;
  users?: {
    id: number;
    merchant_name: string;
    email: string;
    phone?: string;
  };
}

// Subscription interface
export interface Subscription {
  id: number;
  user_id: number;
  plan_type: '3_months' | '6_months' | '1_year' | '1_month_trial';
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_trial: boolean;
  created_at: string;
}

// Merchant subscription status
export interface MerchantSubscription {
  subscription_status: 'inactive' | 'trial' | 'active' | 'suspended';
  trial_ends_at?: string;
  currentSubscription?: Subscription;
}

// Activation payment data
export interface ActivationPaymentData {
  paymentMethod: string;
  phoneNumber: string;
  transactionReference: string;
  amount: number;
  paymentProof?: File;
}

// Subscription payment data
export interface SubscriptionPaymentData {
  planType: '3_months' | '6_months' | '1_year';
  paymentMethod: string;
  phoneNumber: string;
  transactionReference: string;
  paymentProof?: File;
}

// ============================================
// APPROVAL SYSTEM INTERFACES
// ============================================

// Blog/Product approval item interface
export interface ApprovalItem {
  id: number;
  type: 'blog' | 'product';
  title: string;
  description: string;
  submittedBy: {
    id: number;
    name: string;
    email: string;
    company: string;
  };
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  content: {
    images?: string[];
    tags?: string[];
    category?: string;
    price?: number;
    stock?: number;
    [key: string]: any;
  };
}

// ============================================
// API RESPONSE INTERFACES
// ============================================

// Payment API Responses
export interface PaymentResponse {
  success: boolean;
  message: string;
  data: PaymentProof;
}

export interface SubscriptionResponse {
  success: boolean;
  data: MerchantSubscription;
}

export interface PendingPaymentsResponse {
  success: boolean;
  data: PaymentProof[];
}

export interface ApprovalResponse {
  success: boolean;
  message: string;
  data: ApprovalItem[];
}

// ============================================
// REQUEST INTERFACES
// ============================================

export interface ProcessPaymentRequest {
  paymentId: number;
  action: 'approve' | 'reject';
  rejectionReason?: string;
}

export interface ProcessApprovalRequest {
  id: number;
  type: 'blog' | 'product';
  action: 'approve' | 'reject';
  rejectionReason?: string;
}

// ============================================
// CONSTANTS
// ============================================

// Subscription plans constants
export const SUBSCRIPTION_PLANS = {
  '3_months': { name: '3 Months', price: 50, duration: 90 },
  '6_months': { name: '6 Months', price: 90, duration: 180 },
  '1_year': { name: '1 Year', price: 150, duration: 365 }
} as const;

// Approval types
export const APPROVAL_TYPES = {
  blog: 'Blog Post',
  product: 'Product'
} as const;

// Status colors for UI
export const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  approved: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  inactive: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  active: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  trial: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  suspended: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' }
} as const;

// Payment methods display names
export const PAYMENT_METHODS = {
  ecocash: 'EcoCash',
  bank: 'Bank Transfer',
  paynow: 'PayNow',
  onemoney: 'OneMoney',
  telecash: 'Telecash'
} as const;