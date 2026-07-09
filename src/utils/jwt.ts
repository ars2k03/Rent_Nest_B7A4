import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { UserRole } from "../../generated/prisma/client.js";

dotenv.config();

type TokenPayload = {
  id: string;
  email: string;
  role: UserRole;
};

export const generateToken = (payload: TokenPayload) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};
