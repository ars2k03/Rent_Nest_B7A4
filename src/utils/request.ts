import type { Request } from "express";
import { AppError } from "./AppError.js";

export const getAuthUser = (req: Request) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  return req.user;
};

export const getValidatedBody = <T>(req: Request): T => req.body as T;

export const getValidatedQuery = <T>(req: Request): T => req.query as T;

export const getValidatedParams = <T>(req: Request): T => req.params as T;
