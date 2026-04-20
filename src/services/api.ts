import { Challenge, ChallengeCategory, Friendship, Group, LeaderboardEntry, User } from "../types";

/**
 * Base URL for the API. In a real app, this would come from an environment variable.
 */
const API_BASE = (window as any).__SQ_API_BASE__ ?? "http://localhost:4000/api";

/**
 * Retrieves the authentication token from local storage.
 */
function getToken(): string {
  return localStorage.getItem("sq_token") ?? "";
}

/**
 * A generic wrapper for the fetch API that handles common tasks like
 * setting headers, authorization, and basic error handling.
 */
async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) {
      localStorage.removeItem("sq_token");
      if (!path.startsWith("/auth/")) {
        window.location.reload();
      }
    }
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * The main API client object providing methods to interact with the backend.
 */
export const api = {
  /**
   * Authentication endpoints for logging in and registering users.
   */
  auth: {
    login: (identifier: string, password: string) =>
        apiFetch<{ token: string; user: User }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ identifier, password }),
        }),
    register: (payload: any) =>
        apiFetch<{ token: string; user: User }>("/auth/register", {
          method: "POST",
          body: JSON.stringify(payload),
        }),
  },
  /**
   * Friendship and social endpoints for managing the user's guild (roster).
   */
  friends: {
    listAccepted: () =>
        apiFetch<{ friends: User[] }>("/friendships?status=accepted").then(res => res.friends),
    listPending: () =>
        apiFetch<{ requests: Friendship[] }>("/friendships?status=pending").then(res => res.requests),
    sendInvite: (addresseeUsername: string) =>
        apiFetch<{ friendship: Friendship }>("/friendships", {
          method: "POST",
          body: JSON.stringify({ addresseeUsername }),
        }).then(res => res.friendship),
    respond: (id: string, status: "accepted" | "declined") =>
        apiFetch<{ friendship: Friendship }>(`/friendships/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }).then(res => res.friendship),
    search: (query: string) =>
        apiFetch<{ users: User[] }>(`/users/search?q=${query}`).then(res => res.users),
  },
  /**
   * Challenge (Quest) endpoints for managing quests, categories, and progress.
   */
  challenges: {
    listCategories: () =>
        apiFetch<{ categories: ChallengeCategory[] }>("/challenges/categories").then(res => res.categories),
    inbox: () =>
        apiFetch<{ challenges: Challenge[] }>("/challenges/inbox").then(res => res.challenges),
    active: () =>
        apiFetch<{ challenges: Challenge[] }>("/challenges/active").then(res => res.challenges),
    recentCompleted: () =>
        apiFetch<{ challenges: any[] }>("/challenges/recent-completed").then(res => res.challenges),
    create: (payload: any) =>
        apiFetch<{ challenge: Challenge }>("/challenges", {
          method: "POST",
          body: JSON.stringify(payload),
        }).then(res => res.challenge),
    respond: (id: string, status: "accepted" | "declined") =>
        apiFetch<{ challenge: Challenge }>(`/challenges/${id}/respond`, {
          method: "POST",
          body: JSON.stringify({ status }),
        }).then(res => res.challenge),
    complete: (id: string) =>
        apiFetch<{ challenge: Challenge }>(`/challenges/${id}/complete`, {
          method: "POST",
        }).then(res => res.challenge),
    me: () =>
        apiFetch<{ user: User }>("/users/me").then(res => res.user),
  },
  /**
   * Leaderboard (Hall of Fame) endpoints.
   */
  leaderboard: {
    list: (groupId?: string) =>
        apiFetch<{ leaderboard: LeaderboardEntry[] }>(`/leaderboard${groupId ? `?groupId=${encodeURIComponent(groupId)}` : ""}`).then(res => res.leaderboard),
  },
  groups: {
    list: () =>
        apiFetch<{ groups: Group[] }>("/groups").then(res => res.groups),
    get: (id: string) =>
        apiFetch<{ group: Group }>(`/groups/${id}`).then(res => res.group),
    create: (payload: { name: string; memberIds: string[] }) =>
        apiFetch<{ group: Group }>("/groups", {
          method: "POST",
          body: JSON.stringify(payload),
        }).then(res => res.group),
    addMembers: (id: string, memberIds: string[]) =>
        apiFetch<{ group: Group }>(`/groups/${id}/members`, {
          method: "POST",
          body: JSON.stringify({ memberIds }),
        }).then(res => res.group),
    rename: (id: string, name: string) =>
        apiFetch<{ group: Group }>(`/groups/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ name }),
        }).then(res => res.group),
    removeMember: (id: string, memberUserId: string) =>
        apiFetch<{ group: Group | null }>(`/groups/${id}/members/${memberUserId}`, {
          method: "DELETE",
        }).then(res => res.group),
  },
  /**
   * Admin endpoints for managing users and challenges.
   */
  admin: {
    listUsers: (limit?: number, offset?: number, search?: string) => {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (offset) params.append("offset", offset.toString());
      if (search) params.append("search", search);
      return apiFetch<{ users: User[]; total: number }>(`/admin/users${params.toString() ? `?${params}` : ""}`);
    },
    getUserDetail: (userId: string) =>
        apiFetch<{ user: User; sentChallenges: Challenge[]; receivedChallenges: any[] }>(`/admin/users/${userId}`),
    updateUserXp: (userId: string, xp: number) =>
        apiFetch<{ user: User }>(`/admin/users/${userId}`, {
          method: "PATCH",
          body: JSON.stringify({ xp }),
        }).then(res => res.user),
    deleteUser: (userId: string) =>
        apiFetch<{ message: string }>(`/admin/users/${userId}`, {
          method: "DELETE",
        }),
    deleteChallenge: (challengeId: string) =>
        apiFetch<{ message: string }>(`/admin/challenges/${challengeId}`, {
          method: "DELETE",
        }),
  },
};
