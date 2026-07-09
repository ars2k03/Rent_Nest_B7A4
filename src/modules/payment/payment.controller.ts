import type { Request, Response } from "express";
import * as PaymentService from "./payment.service.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";

export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const result = await PaymentService.createPaymentService(req.user!.id, req.body);
  return sendSuccess(res, "Payment session created successfully", result, 201);
});

export const confirmPayment = asyncHandler(async (req: Request, res: Response) => {
  const result = await PaymentService.confirmPaymentService(req.user!.id, req.body);
  return sendSuccess(res, "Payment confirmed successfully", result);
});

export const getPaymentHistory = asyncHandler(async (req: Request, res: Response) => {
  const result = await PaymentService.getPaymentHistoryService(
    req.user!.id,
    req.user!.role,
    req.query
  );
  return sendSuccess(res, "Payment history retrieved successfully", result);
});

export const getPaymentById = asyncHandler(async (req: Request, res: Response) => {
  const result = await PaymentService.getPaymentByIdService(
    req.params.id as string,
    req.user!.id,
    req.user!.role
  );
  return sendSuccess(res, "Payment retrieved successfully", result);
});

export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];

  if (!signature || typeof signature !== "string") {
    return res.status(400).json({
      success: false,
      message: "Missing Stripe signature",
      errorDetails: null,
    });
  }

  const result = await PaymentService.handleStripeWebhookService(
    req.body as Buffer,
    signature
  );

  return sendSuccess(res, "Webhook processed successfully", result);
});

export const sslCommerzCallback = asyncHandler(async (req: Request, res: Response) => {
  const transactionId = req.query.transactionId as string | undefined;

  if (!transactionId) {
    return res.status(400).json({
      success: false,
      message: "Transaction ID is required",
      errorDetails: null,
    });
  }

  const payment = await PaymentService.confirmSslCommerzCallbackService(transactionId);
  return sendSuccess(res, "SSLCommerz payment confirmed successfully", payment);
});
