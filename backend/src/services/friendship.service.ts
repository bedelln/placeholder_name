import { z } from "zod";

import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/errors";

const sendFriendRequestSchema = z.object({
  addresseeUsername: z.string().trim().min(1, "Username is required")
});

const updateFriendshipStatusSchema = z.object({
  status: z.enum(["accepted", "declined"], {
    errorMap: () => ({ message: "Status must be 'accepted' or 'declined'" })
  })
});

export async function getAcceptedFriendIds(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: "accepted",
      OR: [{ requesterId: userId }, { addresseeId: userId }]
    },
    select: {
      requesterId: true,
      addresseeId: true
    }
  });

  return friendships.map((friendship) =>
    friendship.requesterId === userId ? friendship.addresseeId : friendship.requesterId
  );
}

export async function sendFriendRequest(requesterId: string, input: unknown) {
  const data = sendFriendRequestSchema.parse(input);

  // Find the addressee by username
  const addressee = await prisma.user.findUnique({
    where: { username: data.addresseeUsername }
  });

  if (!addressee) {
    throw new ApiError(404, "User not found");
  }

  if (addressee.id === requesterId) {
    throw new ApiError(400, "You cannot send a friend request to yourself");
  }

  // Check if friendship already exists (in either direction)
  const existingFriendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId, addresseeId: addressee.id },
        { requesterId: addressee.id, addresseeId: requesterId }
      ]
    }
  });

  if (existingFriendship) {
    if (existingFriendship.status === "pending") {
      throw new ApiError(409, "Friend request already sent");
    }
    if (existingFriendship.status === "accepted") {
      throw new ApiError(409, "You are already friends");
    }
    // If declined, allow sending again
    await prisma.friendship.delete({ where: { id: existingFriendship.id } });
  }

  const friendship = await prisma.friendship.create({
    data: {
      requesterId,
      addresseeId: addressee.id,
      status: "pending"
    },
    include: {
      requester: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true
        }
      },
      addressee: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true
        }
      }
    }
  });

  return friendship;
}

export async function getPendingFriendRequests(userId: string) {
  const pendingRequests = await prisma.friendship.findMany({
    where: {
      addresseeId: userId,
      status: "pending"
    },
    include: {
      requester: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          xp: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return pendingRequests;
}

export async function getAcceptedFriends(userId: string) {
  // Get friendships where user is either requester or addressee
  const friendships = await prisma.friendship.findMany({
    where: {
      status: "accepted",
      OR: [{ requesterId: userId }, { addresseeId: userId }]
    },
    include: {
      requester: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          xp: true
        }
      },
      addressee: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          xp: true
        }
      }
    }
  });

  // Return the friend (not the current user)
  return friendships.map((friendship) => {
    const friend = friendship.requesterId === userId ? friendship.addressee : friendship.requester;
    return {
      friendshipId: friendship.id,
      ...friend
    };
  });
}

export async function updateFriendshipStatus(
  friendshipId: string,
  userId: string,
  input: unknown
) {
  const data = updateFriendshipStatusSchema.parse(input);

  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId }
  });

  if (!friendship) {
    throw new ApiError(404, "Friend request not found");
  }

  // Only the addressee can accept or decline
  if (friendship.addresseeId !== userId) {
    throw new ApiError(403, "You are not authorized to update this friend request");
  }

  if (friendship.status !== "pending") {
    throw new ApiError(400, "This friend request has already been processed");
  }

  const updatedFriendship = await prisma.friendship.update({
    where: { id: friendshipId },
    data: { status: data.status },
    include: {
      requester: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true
        }
      },
      addressee: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true
        }
      }
    }
  });

  return updatedFriendship;
}

export async function searchUsers(currentUserId: string, searchQuery: string) {
  if (!searchQuery || searchQuery.trim().length < 1) {
    throw new ApiError(400, "Search query must be at least 1 character");
  }

  const users = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: currentUserId } },
        {
          OR: [
            { username: { contains: searchQuery } },
            { displayName: { contains: searchQuery } }
          ]
        }
      ]
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      xp: true
    },
    take: 20
  });

  return users;
}
