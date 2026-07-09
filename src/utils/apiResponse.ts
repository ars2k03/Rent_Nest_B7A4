import type { Response } from "express";

export const sendSuccess = (
  res: Response,
  message: string,
  data?: unknown,
  statusCode = 200
) => {
  const payload: Record<string, unknown> = {
    success: true,
    message,
    errorDetails: null,
  };

  if (data !== undefined) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errorDetails: unknown = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
  });
};
