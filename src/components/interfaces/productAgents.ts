// Product Agent Interfaces
export interface ProductAgent {
  id: number;
  product_id: number;
  user_id: number;
  full_name: string;
  national_id: string;
  id_document_url?: string;
  payout_method: 'ecocash' | 'bank' | 'paynow' | 'onemoney' | 'telecash';
  payout_number?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_at: string;
  approved_at?: string;
  approved_by?: number;
  reviewed_at?: string;
  reviewed_by?: number;
  rejection_reason?: string;
  agent_code?: string;
  commission_rate: string;
  total_sales: number;
  total_commission: string;
  products?: {
    id: number;
    name: string;
    price: string;
    image_url: string;
    approval_status?: string;
    is_visible?: boolean;
  };
  users?: {
    id: number;
    username?: string;
    email: string;
    phone?: string;
  };
}

export interface AgentApplication {
  productId: number;
  fullName: string;
  nationalId: string;
  idDocumentUrl?: string;
  payoutMethod: 'ecocash' | 'bank' | 'paynow' | 'onemoney' | 'telecash';
  payoutNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  reason?: string;
  acceptedTerms: boolean;
}

export interface AgentReferralLink {
  referralLink: string;
  agentCode: string;
  commissionRate: string;
  product: {
    id: number;
    name: string;
    price: string;
    image_url: string;
  };
}

export interface AgentStats {
  agent_code?: string;
  commission_rate: string;
  total_sales: number;
  total_commission: string;
  status: string;
  product: {
    id: number;
    name: string;
  };
}

export interface AgentApplicationResponse {
  success: boolean;
  message: string;
  data: ProductAgent;
  warning?: string;
}

export interface AgentReferralResponse {
  success: boolean;
  message: string;
  data: AgentReferralLink;
}