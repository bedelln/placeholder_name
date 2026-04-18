import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");
const prismaDir = path.join(backendDir, "prisma");

dotenv.config({ path: path.join(backendDir, ".env") });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || !databaseUrl.startsWith("file:")) {
  throw new Error("DATABASE_URL must be a SQLite file URL, for example file:./dev.db");
}

const databasePath = path.resolve(prismaDir, databaseUrl.slice("file:".length));
const db = new DatabaseSync(databasePath);
const isSeedOnly = process.argv.includes("--seed-only");

const categories = [
  ["cat_fitness", "Fitness", "\uD83D\uDCAA", "#e74c3c", 15],
  ["cat_courage", "Courage", "\uD83E\uDD81", "#f39c12", 20],
  ["cat_creativity", "Creativity", "\uD83C\uDFA8", "#9b59b6", 15],
  ["cat_wisdom", "Wisdom", "\uD83D\uDCDA", "#3498db", 10],
  ["cat_social", "Social", "\uD83E\uDD1D", "#2ecc71", 10],
  ["cat_adventure", "Adventure", "\uD83D\uDEF6\uFE0F", "#1abc9c", 25]
];

function createSchema() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "username" TEXT NOT NULL UNIQUE,
      "email" TEXT NOT NULL UNIQUE,
      "passwordHash" TEXT NOT NULL,
      "displayName" TEXT NOT NULL,
      "avatarUrl" TEXT NOT NULL DEFAULT '',
      "xp" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Friendship" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "requesterId" TEXT NOT NULL,
      "addresseeId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY ("addresseeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      UNIQUE ("requesterId", "addresseeId")
    );

    CREATE TABLE IF NOT EXISTS "ChallengeCategory" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL UNIQUE,
      "icon" TEXT NOT NULL,
      "color" TEXT NOT NULL,
      "xpReward" INTEGER NOT NULL DEFAULT 10
    );

    CREATE TABLE IF NOT EXISTS "Challenge" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "senderId" TEXT NOT NULL,
      "categoryId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "xpReward" INTEGER NOT NULL,
      "expiresAt" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY ("categoryId") REFERENCES "ChallengeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "ChallengeRecipient" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "challengeId" TEXT NOT NULL,
      "recipientId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "completedAt" DATETIME,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      UNIQUE ("challengeId", "recipientId")
    );

    CREATE TABLE IF NOT EXISTS "Group" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "creatorId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "GroupMember" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "groupId" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      UNIQUE ("groupId", "userId")
    );

    CREATE INDEX IF NOT EXISTS "Friendship_requesterId_idx" ON "Friendship"("requesterId");
    CREATE INDEX IF NOT EXISTS "Friendship_addresseeId_idx" ON "Friendship"("addresseeId");
    CREATE INDEX IF NOT EXISTS "Friendship_status_idx" ON "Friendship"("status");
    CREATE INDEX IF NOT EXISTS "Challenge_senderId_idx" ON "Challenge"("senderId");
    CREATE INDEX IF NOT EXISTS "Challenge_categoryId_idx" ON "Challenge"("categoryId");
    CREATE INDEX IF NOT EXISTS "ChallengeRecipient_recipientId_idx" ON "ChallengeRecipient"("recipientId");
    CREATE INDEX IF NOT EXISTS "ChallengeRecipient_status_idx" ON "ChallengeRecipient"("status");
    CREATE INDEX IF NOT EXISTS "Group_creatorId_idx" ON "Group"("creatorId");
    CREATE INDEX IF NOT EXISTS "GroupMember_userId_idx" ON "GroupMember"("userId");
  `);
}

function seedCategories() {
  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO "ChallengeCategory" ("id", "name", "icon", "color", "xpReward")
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const category of categories) {
    insertCategory.run(...category);
  }
}

try {
  if (!isSeedOnly) {
    createSchema();
  }

  seedCategories();

  console.log(`SQLite database ready at ${databasePath}`);
  console.log(`Challenge categories available: ${categories.length}`);
} finally {
  db.close();
}
