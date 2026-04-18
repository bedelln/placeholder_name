import { z } from "zod";

import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/errors";
import { getAcceptedFriendIds } from "./friendship.service";

const createGroupSchema = z.object({
  name: z.string().trim().min(1, "Group name is required").max(50, "Group name must be 50 characters or fewer"),
  memberIds: z.array(z.string().trim().min(1)).default([])
});

const addGroupMembersSchema = z.object({
  memberIds: z.array(z.string().trim().min(1)).min(1, "Select at least one friend to add")
});

const renameGroupSchema = z.object({
  name: z.string().trim().min(1, "Group name is required").max(50, "Group name must be 50 characters or fewer")
});

const userSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  xp: true,
  createdAt: true
} as const;

const groupInclude = {
  members: {
    include: {
      user: {
        select: userSelect
      }
    },
    orderBy: {
      createdAt: "asc" as const
    }
  }
} as const;

function mapGroup(group: {
  id: string;
  name: string;
  creatorId: string;
  createdAt: Date;
  members: Array<{
    id: string;
    userId: string;
    createdAt: Date;
    user: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl: string;
      xp: number;
      createdAt: Date;
    };
  }>;
}) {
  return {
    id: group.id,
    name: group.name,
    creatorId: group.creatorId,
    createdAt: group.createdAt,
    members: group.members.map((member) => ({
      id: member.id,
      userId: member.userId,
      createdAt: member.createdAt,
      user: member.user
    }))
  };
}

async function ensureGroupMember(groupId: string, userId: string) {
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId
      }
    }
  });

  if (!membership) {
    throw new ApiError(403, "You are not a member of this group");
  }
}

export async function listGroups(userId: string) {
  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: {
          userId
        }
      }
    },
    include: groupInclude,
    orderBy: {
      createdAt: "desc"
    }
  });

  return groups.map(mapGroup);
}

export async function getGroupById(groupId: string, userId: string) {
  const group = await prisma.group.findFirst({
    where: {
      id: groupId,
      members: {
        some: {
          userId
        }
      }
    },
    include: groupInclude
  });

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  return mapGroup(group);
}

export async function createGroup(userId: string, input: unknown) {
  const data = createGroupSchema.parse(input);
  const friendIds = await getAcceptedFriendIds(userId);
  const friendIdSet = new Set(friendIds);
  const invalidMemberId = data.memberIds.find((memberId) => !friendIdSet.has(memberId));

  if (invalidMemberId) {
    throw new ApiError(403, "You can only add users from your friends list");
  }

  const uniqueMemberIds = [...new Set([userId, ...data.memberIds])];

  const group = await prisma.group.create({
    data: {
      name: data.name,
      creatorId: userId,
      members: {
        create: uniqueMemberIds.map((memberId) => ({
          userId: memberId
        }))
      }
    },
    include: groupInclude
  });

  return mapGroup(group);
}

export async function addGroupMembers(groupId: string, userId: string, input: unknown) {
  const data = addGroupMembersSchema.parse(input);

  await ensureGroupMember(groupId, userId);

  const friendIds = await getAcceptedFriendIds(userId);
  const friendIdSet = new Set(friendIds);
  const invalidMemberId = data.memberIds.find((memberId) => !friendIdSet.has(memberId));

  if (invalidMemberId) {
    throw new ApiError(403, "You can only add users from your friends list");
  }

  const uniqueMemberIds = [...new Set(data.memberIds)];
  const existingMembers = await prisma.groupMember.findMany({
    where: {
      groupId,
      userId: {
        in: uniqueMemberIds
      }
    },
    select: {
      userId: true
    }
  });
  const existingMemberIds = new Set(existingMembers.map((member) => member.userId));

  if (uniqueMemberIds.some((memberId) => !existingMemberIds.has(memberId))) {
    await prisma.groupMember.createMany({
      data: uniqueMemberIds
        .filter((memberId) => !existingMemberIds.has(memberId))
        .map((memberId) => ({
          groupId,
          userId: memberId
        }))
    });
  }

  return getGroupById(groupId, userId);
}

export async function renameGroup(groupId: string, userId: string, input: unknown) {
  const data = renameGroupSchema.parse(input);

  await ensureGroupMember(groupId, userId);

  await prisma.group.update({
    where: { id: groupId },
    data: { name: data.name }
  });

  return getGroupById(groupId, userId);
}

export async function removeGroupMember(groupId: string, actorUserId: string, memberUserId: string) {
  await ensureGroupMember(groupId, actorUserId);

  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: memberUserId
      }
    }
  });

  if (!membership) {
    throw new ApiError(404, "Group member not found");
  }

  const memberCount = await prisma.groupMember.count({
    where: {
      groupId
    }
  });

  if (memberCount <= 1) {
    throw new ApiError(400, "A group must keep at least one member");
  }

  await prisma.groupMember.delete({
    where: {
      groupId_userId: {
        groupId,
        userId: memberUserId
      }
    }
  });

  if (actorUserId === memberUserId) {
    const groupStillVisible = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: actorUserId
        }
      }
    });

    if (!groupStillVisible) {
      return null;
    }
  }

  return getGroupById(groupId, actorUserId);
}
