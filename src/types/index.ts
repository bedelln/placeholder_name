/**
 * Represents a user in the Sidequesting application.
 */
export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  xp: number;
  createdAt: string;
}

/**
 * Represents a friendship between two users.
 */
export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: "pending" | "accepted" | "declined";
  requester?: User;
  addressee?: User;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  id: string;
  userId: string;
  createdAt: string;
  user: User;
}

export interface Group {
  id: string;
  name: string;
  creatorId: string;
  createdAt: string;
  members: GroupMember[];
}

/**
 * Defines a category for challenges, including metadata for UI representation and rewards.
 */
export interface ChallengeCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  xpReward: number;
}

/**
 * Represents a specific challenge issued to a user.
 */
export interface Challenge {
  id: string;
  senderId: string;
  sender?: User;
  categoryId: string;
  category?: ChallengeCategory;
  title: string;
  description: string;
  xpReward: number;
  expiresAt?: string;
  createdAt: string;
  recipientStatus?: "pending" | "accepted" | "completed" | "declined";
  recipientRecordId?: string;
}

/**
 * An entry for a leaderboard, including the user's rank and data.
 */
export interface LeaderboardEntry {
  rank: number;
  user: User;
  isCurrentUser?: boolean;
}

// Navigation and UI state types
export type Tab = "quests" | "guild" | "fame" | "profile";
export type QuestTab = "inbox" | "active";
export type GuildTab = "roster" | "invites" | "groups";
