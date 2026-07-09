import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { sendError } from "../utils/apiResponse.js";
import { AppError } from "../utils/AppError.js";
import type { UserRole } from "@prisma/client";

type TokenPayload = {
  id: string;
  email: string;
  role: UserRole;
};

export const authenticate =
  () => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        return sendError(res, "Authentication required", 401);
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        return sendError(res, "Authentication required", 401);
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as TokenPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, isDeleted: true },
      });

      if (!user || user.isDeleted) {
        return sendError(res, "User not found or account is banned", 401);
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      return next();
    } catch {
      return sendError(res, "Invalid or expired token", 401);
    }
  };

export const authorize =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission", 403));
    }

    return next();
  };
