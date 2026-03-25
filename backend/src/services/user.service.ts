import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/errors";

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true
    }
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
}
