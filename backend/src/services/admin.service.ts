import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/errors";

export async function listUsers(limit: number = 20, offset: number = 0, search?: string) {
  const where = search
    ? {
        OR: [
          { username: { contains: search } },
          { displayName: { contains: search } }
        ]
      }
    : undefined;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        xp: true,
        role: true,
        createdAt: true
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma.user.count({ where })
  ]);

  return { users, total };
}

export async function getUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      xp: true,
      role: true,
      createdAt: true
    }
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Get challenges sent by user
  const sentChallenges = await prisma.challenge.findMany({
    where: { senderId: userId },
    include: {
      category: true,
      recipients: {
        include: {
          recipient: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // Get challenges received by user
  const receivedChallenges = await prisma.challengeRecipient.findMany({
    where: { recipientId: userId },
    include: {
      challenge: {
        include: {
          category: true,
          sender: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return {
    user,
    sentChallenges,
    receivedChallenges
  };
}

export async function updateUserXp(userId: string, xp: number) {
  if (xp < 0) {
    throw new ApiError(400, "XP cannot be negative");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "admin") {
    throw new ApiError(403, "Cannot modify admin accounts");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { xp },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      xp: true,
      role: true,
      createdAt: true
    }
  });

  return updatedUser;
}

export async function deleteUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Cascade delete is handled by Prisma schema
  await prisma.user.delete({
    where: { id: userId }
  });

  return { message: "User deleted successfully" };
}

export async function deleteChallenge(challengeId: string) {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId }
  });

  if (!challenge) {
    throw new ApiError(404, "Challenge not found");
  }

  await prisma.challenge.delete({
    where: { id: challengeId }
  });

  return { message: "Challenge deleted successfully" };
}
