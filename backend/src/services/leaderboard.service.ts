import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/errors";
import { getAcceptedFriendIds } from "./friendship.service";

export async function getLeaderboard(userId: string, groupId?: string) {
  let allUserIds: string[];

  if (groupId) {
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        members: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!group) {
      throw new ApiError(404, "Group not found");
    }

    allUserIds = group.members.map((member: { userId: string }) => member.userId);
  } else {
    const friendIds = await getAcceptedFriendIds(userId);
    allUserIds = [userId, ...friendIds];
  }

  const leaderboard = await prisma.user.findMany({
    where: {
      id: { in: [...new Set(allUserIds)] }
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      xp: true
    },
    orderBy: {
      xp: "desc"
    }
  });

  const rankedLeaderboard = leaderboard.map((user, index) => ({
    rank: index + 1,
    user,
    isCurrentUser: user.id === userId
  }));

  return rankedLeaderboard;
}
