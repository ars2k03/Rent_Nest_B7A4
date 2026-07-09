import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { sendError } from "../utils/apiResponse.js";

export const notFoundHandler = (req: Request, res: Response) => {
  return sendError(res, `Route ${req.originalUrl} not found`, 404);
};

export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errorDetails);
  }

  if (err instanceof Error) {
    return sendError(res, err.message, 500);
  }

  return sendError(res, "Internal server error", 500);
};
