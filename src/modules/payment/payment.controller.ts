import type { Request, Response } from "express";
import * as PaymentService from "./payment.service.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import {
  getAuthUser,
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "../../utils/request.js";
import type {
  ConfirmPaymentInput,
  CreatePaymentInput,
  PaymentIdParams,
  PaymentQueryInput,
} from "../../validators/payment.validator.js";

export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const body = getValidatedBody<CreatePaymentInput>(req);
  const result = await PaymentService.createPaymentService(user.id, body);
  return sendSuccess(res, "Payment session created successfully", result, 201);
});

export const confirmPayment = asyncHandler(async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const body = getValidatedBody<ConfirmPaymentInput>(req);
  const result = await PaymentService.confirmPaymentService(user.id, body);
  return sendSuccess(res, "Payment confirmed successfully", result);
});

export const getPaymentHistory = asyncHandler(async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const query = getValidatedQuery<PaymentQueryInput>(req);
  const result = await PaymentService.getPaymentHistoryService(
    user.id,
    user.role,
    query
  );
  return sendSuccess(res, "Payment history retrieved successfully", result);
});

export const getPaymentById = asyncHandler(async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { id } = getValidatedParams<PaymentIdParams>(req);
  const result = await PaymentService.getPaymentByIdService(id, user.id, user.role);
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

  if (!Buffer.isBuffer(req.body)) {
    return res.status(400).json({
      success: false,
      message: "Invalid webhook payload",
      errorDetails: null,
    });
  }

  const result = await PaymentService.handleStripeWebhookService(req.body, signature);
  return sendSuccess(res, "Webhook processed successfully", result);
});

export const sslCommerzCallback = asyncHandler(async (req: Request, res: Response) => {
  const transactionId = req.query.transactionId;

  if (typeof transactionId !== "string" || transactionId.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Transaction ID is required",
      errorDetails: null,
    });
  }

  const payment = await PaymentService.confirmSslCommerzCallbackService(transactionId);
  return sendSuccess(res, "SSLCommerz payment confirmed successfully", payment);
});
