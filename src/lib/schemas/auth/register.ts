import { z } from "zod";

const simplePasswordRegex = /^(?=.*\d).{6,}$/;
const flexiblePhoneRegex = /^(\+?263|0)?[1-9]\d{6,9}$/;

// ============================================
// CLIENT ADMIN (MERCHANT) REGISTRATION - GOOGLE ONLY
// ============================================
export const clientAdminRegisterSchema = z.object({
  merchantName: z.string().min(2, { message: 'Merchant name must be at least 2 characters' }).max(200),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string()
    .min(9, { message: 'Phone number too short' })
    .max(15, { message: 'Phone number too long' })
    .regex(flexiblePhoneRegex, {
      message: 'Please enter a valid phone number'
    }),
  physicalAddress: z.string().min(5, { message: 'Physical address is required' }),
  geoLocation: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }),
  authProvider: z.literal('google'),
  googleId: z.string().optional(),
  role: z.literal('client_admin')
});

export type ClientAdminRegisterInput = z.infer<typeof clientAdminRegisterSchema>;

// ============================================
// CLIENT (CUSTOMER) REGISTRATION
// ============================================
export const clientRegisterSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).max(100),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string()
    .min(9, { message: 'Phone number too short' })
    .max(15, { message: 'Phone number too long' })
    .regex(flexiblePhoneRegex, {
      message: 'Please enter a valid phone number'
    }),
  authProvider: z.enum(['email', 'google', 'apple', 'facebook']),
  googleId: z.string().optional(),
  appleId: z.string().optional(),
  facebookId: z.string().optional(),
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .regex(simplePasswordRegex, {
      message: 'Password must contain at least 1 number'
    })
    .optional(),
  confirmPassword: z.string().optional(),
  role: z.literal('client')
}).refine(
  data => {
    if (data.authProvider === 'email') {
      return data.password && data.password.length >= 6;
    }
    return true;
  },
  {
    message: 'Password is required for email registration',
    path: ['password']
  }
).refine(
  data => {
    if (data.authProvider === 'email' && data.password && data.confirmPassword) {
      return data.password === data.confirmPassword;
    }
    return true;
  },
  {
    message: "Passwords don't match",
    path: ['confirmPassword']
  }
);

export type ClientRegisterInput = z.infer<typeof clientRegisterSchema>;

// ============================================
// AUTH REGISTER RESPONSE
// ============================================
export const authRegisterSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: z.object({
      id: z.number(),
      username: z.string().optional(),
      name: z.string().optional(),
      merchant_name: z.string().optional(),
      email: z.string(),
      phone: z.string().nullable(),
      role: z.enum(['super_admin', 'digital_marketer_admin', 'client_admin', 'client'])
    }),
    token: z.string(),
  })
});

export type AuthRegisterResponse = z.infer<typeof authRegisterSchema>;




// ============================================
// SIMPLE AUTH REGISTER (REQUEST) - FRONTEND
// ============================================
export const agentRegisterSchema = z.object({
  commissionRate: z.number()
    .min(0, { message: 'Commission rate must be at least 0%' })
    .max(100, { message: 'Commission rate cannot exceed 100%' })
    .optional(),
  payoutMethod: z.enum(['ecocash', 'bank', 'paynow', 'onemoney', 'telecash'])
    .optional(),
  payoutNumber: z.string()
    .min(9, { message: 'Payout number too short' })
    .max(15, { message: 'Payout number too long' })
    .regex(flexiblePhoneRegex, { message: 'Please enter a valid phone number' })
    .optional(),
  payoutName: z.string()
    .min(2, { message: 'Payout name must be at least 2 characters' })
    .max(100)
    .optional(),
  minPayoutAmount: z.number()
    .min(1, { message: 'Minimum payout amount must be at least $1' })
    .optional(),
});

export type AgentRegisterInput = z.infer<typeof agentRegisterSchema>;









