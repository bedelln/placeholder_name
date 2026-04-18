import { z } from "zod";

import { signAccessToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/errors";
import { hashPassword, verifyPassword } from "../utils/passwords";

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username must be at most 30 characters long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().trim().email("A valid email is required"),
  password: z.string().min(8, "Password needs to be at least 8 characters").max(72),
  displayName: z.string().trim().min(1, "Display name is required").max(50)
});

const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required")
});

type SafeUser = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  xp: number;
  createdAt: Date;
};

function toSafeUser(user: SafeUser): SafeUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    xp: user.xp,
    createdAt: user.createdAt
  };
}

export async function registerUser(input: unknown) {
  const data = registerSchema.parse(input);
  const email = data.email.toLowerCase();

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username: data.username }]
    }
  });

  if (existingUser?.email === email) {
    throw new ApiError(409, "Email is already in use");
  }

  if (existingUser?.username === data.username) {
    throw new ApiError(409, "Username is already in use");
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      username: data.username,
      email,
      passwordHash,
      displayName: data.displayName
    }
  });

  return {
    token: signAccessToken(user.id),
    user: toSafeUser(user)
  };
}

export async function loginUser(input: unknown) {
  const data = loginSchema.parse(input);
  const identifier = data.identifier.trim();

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier.toLowerCase() }, { username: identifier }]
    }
  });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isValidPassword = await verifyPassword(data.password, user.passwordHash);

  if (!isValidPassword) {
    throw new ApiError(401, "Invalid credentials");
  }

  return {
    token: signAccessToken(user.id),
    user: toSafeUser(user)
  };
}
