import { z } from "zod";

export const stripeWebhookHeadersSchema = z.object({
  "stripe-signature": z.string().min(1),
});

export const sslCommerzCallbackQuerySchema = z.object({
  transactionId: z.string().min(1),
});

export const createPaymentSchema = z.object({
  rentalRequestId: z.string().min(1),
  provider: z.enum(["STRIPE", "SSLCOMMERZ"]),
});

export const confirmPaymentSchema = z.object({
  rentalRequestId: z.string().min(1),
  transactionId: z.string().min(1),
  provider: z.enum(["STRIPE", "SSLCOMMERZ"]),
  paymentIntentId: z.string().optional(),
});

export const paymentIdSchema = z.object({
  id: z.string().min(1),
});

export const paymentQuerySchema = z.object({
  status: z.enum(["PENDING", "COMPLETED", "FAILED"]).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
export type PaymentIdParams = z.infer<typeof paymentIdSchema>;
export type PaymentQueryInput = z.infer<typeof paymentQuerySchema>;
