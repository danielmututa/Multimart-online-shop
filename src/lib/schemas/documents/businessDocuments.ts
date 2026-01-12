import { z } from "zod";

export const businessDocumentSchema = z.object({
  id: z.number(),
  merchant_id: z.number(),
  product_id: z.number().nullable(),
  document_type: z.string(),
  document_url: z.string(),
  document_name: z.string(),
  file_size: z.number(),
  approval_status: z.enum(['pending', 'approved', 'rejected']),
  uploaded_at: z.string(),
  approved_at: z.string().nullable(),
  approved_by: z.number().nullable(),
  rejection_reason: z.string().nullable(),
  expires_at: z.string().nullable(),
});

export type BusinessDocument = z.infer<typeof businessDocumentSchema>;

export const uploadDocumentSchema = z.object({
  documentType: z.enum(['business_license', 'tax_cert', 'registration']),
  productId: z.number().optional(),
  expiresAt: z.string().optional(),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;