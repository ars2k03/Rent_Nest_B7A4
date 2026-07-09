import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import { generateToken } from "../../utils/jwt.js";
import { AppError } from "../../utils/AppError.js";
import { sanitizeUser } from "../../utils/sanitizeUser.js";
import type {
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from "../../validators/auth.validator.js";
import type { Prisma } from "@prisma/client";

export const createUser = async (payload: RegisterInput) => {
  const { name, email, password, role, phone } = payload;

  const isUserExists = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExists) {
    throw new AppError("Email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      ...(phone ? { phone } : {}),
    },
  });

  return sanitizeUser(user);
};

export const loginUserService = async (payload: LoginInput) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (user.isDeleted) {
    throw new AppError("Your account has been banned", 403);
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: sanitizeUser(user),
  };
};

export const getCurrentUserService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.isDeleted) {
    throw new AppError("User not found", 404);
  }

  return sanitizeUser(user);
};

export const updateProfileService = async (
  userId: string,
  payload: UpdateProfileInput
) => {
  const data: Prisma.UserUpdateInput = {};

  if (payload.name !== undefined) {
    data.name = payload.name;
  }

  if (payload.phone !== undefined) {
    data.phone = payload.phone;
  }

  if (payload.password !== undefined) {
    data.password = await bcrypt.hash(payload.password, 10);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return sanitizeUser(user);
};
