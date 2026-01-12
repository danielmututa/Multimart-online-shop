// src/components/interfaces/auth.ts

export interface User {
  id: number;
  username?: string;
  name?: string;
  merchant_name?: string; // ✅ Keep this (backend uses snake_case)
  email: string;
  phone: string | null;
  role: 'super_admin' | 'digital_marketer_admin' | 'client_admin' | 'client' | 'agent'; // ✅ Correct roles
  auth_provider?: 'email' | 'google' | 'apple' | 'facebook'; // ✅ Keep snake_case
  google_id?: string | null; // ✅ Keep snake_case
  facebook_id?: string | null;
  apple_id?: string | null;
}



export interface Agent {
  id?: number; // optional if not yet created
  name?: string;
  phone?: string;
  email?: string;
  commissionRate?: number;
  payoutMethod?: 'ecocash' | 'bank' | 'paynow' | 'onemoney' | 'telecash';
  payoutNumber?: string;
  payoutName?: string;
  minPayoutAmount?: number;
}

export interface AuthData {
  user: User;
  token: string;
}

export interface AuthResponse {
  success: boolean;
  data: AuthData;
}

export interface AuthRegisterResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}




export interface AgentRegisterData {
  agent: Agent;
  token?: string; 
}

export interface AgentRegisterResponse {
  success: boolean;
  data: AgentRegisterData;
}




