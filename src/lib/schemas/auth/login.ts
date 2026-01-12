import { z } from "zod";

// ============================================
// AUTH PROVIDERS
// ============================================
export const AuthProvider = z.enum(['email', 'google', 'apple', 'facebook']);
export type AuthProvider = z.infer<typeof AuthProvider>;

// ============================================
// USER ROLES (agent added here)
// ============================================
export const UserRole = z.enum(['super_admin', 'digital_marketer_admin', 'client_admin', 'client', 'agent']);
export type UserRole = z.infer<typeof UserRole>;

// ============================================
// USER SCHEMA (matches backend response)
// ============================================
export const userSchema = z.object({
  id: z.number(),
  username: z.string().optional(),
  name: z.string().optional(),
  merchant_name: z.string().optional(),
  email: z.string().email(),
  phone: z.string().nullable(),
  role: UserRole,
  auth_provider: AuthProvider.optional(),
  google_id: z.string().optional().nullable(),
  apple_id: z.string().optional().nullable(),
  facebook_id: z.string().optional().nullable(),
  agent_code: z.string().optional().nullable(),  // Added for agents
});

export type User = z.infer<typeof userSchema>;

// ============================================
// UNIVERSAL LOGIN SCHEMA (matches backend)
// agent login now supported
// ============================================
export const loginSchema = z.object({
  username: z.string().optional(), // For super_admin & agent login
  email: z.string().email().optional(), // For client & client_admin login
  password: z.string().min(1, { message: 'Password is required' }).optional(),
  phone: z.string().optional(),
  authProvider: AuthProvider.optional(),
  googleId: z.string().optional(),
  appleId: z.string().optional(),
  facebookId: z.string().optional(),
  role: UserRole.optional() // agent included
})
.refine(
  data => data.username || data.email,
  {
    message: 'Either username or email is required',
    path: ['username']
  }
);

export type LoginSchema = z.infer<typeof loginSchema>;

// ============================================
// AUTH RESPONSE SCHEMA
// ============================================
export const authResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: userSchema,
    token: z.string(),
  })
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

// ============================================
// PASSWORD SCHEMAS (simplified to match backend)
// ============================================
const simplePasswordRegex = /^(?=.*\d).{6,}$/;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string()
    .min(6, { message: "New password must be at least 6 characters" })
    .regex(simplePasswordRegex, {
      message: "New password must contain at least 1 number"
    }),
  confirmNewPassword: z.string()
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"]
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string()
    .min(6, { message: "Password must be at least 6 characters" })
    .regex(simplePasswordRegex, {
      message: "Password must contain at least 1 number"
    }),
  confirmNewPassword: z.string()
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"]
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" })
});













// import { z } from "zod";

// // ============================================
// // AUTH PROVIDERS
// // ============================================
// export const AuthProvider = z.enum(['email', 'google', 'apple', 'facebook']);
// export type AuthProvider = z.infer<typeof AuthProvider>;

// // ============================================
// // USER ROLES
// // ============================================
// export const UserRole = z.enum(['super_admin', 'digital_marketer_admin', 'client_admin', 'client']);
// export type UserRole = z.infer<typeof UserRole>;

// // ============================================
// // USER SCHEMA (matches backend response)
// // ============================================
// export const userSchema = z.object({
//   id: z.number(),
//   username: z.string().optional(),
//   name: z.string().optional(),
//   merchant_name: z.string().optional(),
//   email: z.string().email(),
//   phone: z.string().nullable(),
//   role: UserRole,
//   auth_provider: AuthProvider.optional(),
//   google_id: z.string().optional().nullable(),
//   apple_id: z.string().optional().nullable(),
//   facebook_id: z.string().optional().nullable(),
// });

// export type User = z.infer<typeof userSchema>;

// // ============================================
// // UNIVERSAL LOGIN SCHEMA (matches backend)
// // ============================================
// export const loginSchema = z.object({
//   username: z.string().optional(), // For admins
//   email: z.string().email().optional(), // For clients/client_admins
//   password: z.string().min(1, { message: 'Password is required' }).optional(),
//   phone: z.string().optional(),
//   authProvider: AuthProvider.optional(),
//   googleId: z.string().optional(),
//   appleId: z.string().optional(),
//   facebookId: z.string().optional(),
//   role: UserRole.optional()
// }).refine(
//   data => data.username || data.email,
//   {
//     message: 'Either username or email is required',
//     path: ['username']
//   }
// );

// export type LoginSchema = z.infer<typeof loginSchema>;

// // ============================================
// // AUTH RESPONSE SCHEMA
// // ============================================
// export const authResponseSchema = z.object({
//   success: z.boolean(),
//   data: z.object({
//     user: userSchema,
//     token: z.string(),
//   })
// });

// export type AuthResponse = z.infer<typeof authResponseSchema>;

// // ============================================
// // PASSWORD SCHEMAS (simplified to match backend)
// // ============================================
// const simplePasswordRegex = /^(?=.*\d).{6,}$/;

// export const changePasswordSchema = z.object({
//   currentPassword: z.string().min(1, { message: "Current password is required" }),
//   newPassword: z.string()
//     .min(6, { message: "New password must be at least 6 characters" })
//     .regex(simplePasswordRegex, {
//       message: "New password must contain at least 1 number"
//     }),
//   confirmNewPassword: z.string()
// }).refine(data => data.newPassword === data.confirmNewPassword, {
//   message: "Passwords don't match",
//   path: ["confirmNewPassword"]
// });

// export const resetPasswordSchema = z.object({
//   token: z.string(),
//   newPassword: z.string()
//     .min(6, { message: "Password must be at least 6 characters" })
//     .regex(simplePasswordRegex, {
//       message: "Password must contain at least 1 number"
//     }),
//   confirmNewPassword: z.string()
// }).refine(data => data.newPassword === data.confirmNewPassword, {
//   message: "Passwords don't match",
//   path: ["confirmNewPassword"]
// });

// export const forgotPasswordSchema = z.object({
//   email: z.string().email({ message: "Please enter a valid email address" })
// });









