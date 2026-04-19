import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding mock data...");

  // 1. Categories
  const categories = [
    { id: "c1", name: "Fitness",    icon: "⚔️",  color: "#e05555", xpReward: 100 },
    { id: "c2", name: "Courage",    icon: "🛡️",  color: "#f0c040", xpReward: 150 },
    { id: "c3", name: "Wisdom",     icon: "📜",  color: "#2de0b0", xpReward: 80  },
    { id: "c4", name: "Creativity", icon: "🔮",  color: "#a855f7", xpReward: 120 },
    { id: "c5", name: "Endurance",  icon: "🔥",  color: "#f97316", xpReward: 200 },
    { id: "c6", name: "Social",     icon: "⭐",  color: "#3b82f6", xpReward: 60  },
  ];

  for (const cat of categories) {
    await prisma.challengeCategory.upsert({
      where: { name: cat.name },
      update: cat,
      create: cat,
    });
  }
  console.log("Categories seeded.");

  // 2. Users
  const passwordHash = await bcrypt.hash("password123", 10);
  
  const users = [
    { id: "u-000", username: "heroprotagonist", displayName: "Hero Protagonist", email: "hero@example.com", avatarUrl: "", xp: 1250, passwordHash },
    { id: "u-1", username: "theron", displayName: "Theron Gale", email: "theron@example.com", avatarUrl: "", xp: 2380, passwordHash },
    { id: "u-2", username: "lyra",   displayName: "Lyra Emberveil", email: "lyra@example.com", avatarUrl: "", xp: 1990, passwordHash },
    { id: "u-3", username: "daxon",  displayName: "Daxon Crest", email: "daxon@example.com", avatarUrl: "", xp: 1740, passwordHash },
    { id: "u-4", username: "selva",  displayName: "Selva Nightrun", email: "selva@example.com", avatarUrl: "", xp: 980, passwordHash },
    { id: "u-5", username: "zephyra", displayName: "Zephyra Dusk", email: "zephyra@example.com", avatarUrl: "", xp: 550, passwordHash },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user,
    });
  }
  console.log("Users seeded.");

  // 3. Friendships
  const friendships = [
    { id: "fr-0", requesterId: "u-1", addresseeId: "u-000", status: "accepted" },
    { id: "fr-1", requesterId: "u-2", addresseeId: "u-000", status: "accepted" },
    { id: "fr-2", requesterId: "u-3", addresseeId: "u-000", status: "accepted" },
    { id: "fr-3", requesterId: "u-4", addresseeId: "u-000", status: "accepted" },
    { id: "fr-p1", requesterId: "u-5", addresseeId: "u-000", status: "pending" },
  ];

  for (const fs of friendships) {
    await prisma.friendship.upsert({
      where: { id: fs.id },
      update: fs,
      create: fs,
    });
  }
  console.log("Friendships seeded.");

  // 4. Challenges
  const challenges = [
    {
      id: "ch-1",
      senderId: "u-1",
      categoryId: "c1",
      title: "Dawn Warrior",
      description: "Complete a 30-minute workout before sunrise. Screenshot your fitness app as proof.",
      xpReward: 150,
      createdAt: new Date(Date.now() - 3600000),
      expiresAt: new Date(Date.now() + 2 * 86400000),
      recipients: {
        create: {
          id: "rr-1",
          recipientId: "u-000",
          status: "pending",
        }
      }
    },
    {
      id: "ch-2",
      senderId: "u-2",
      categoryId: "c3",
      title: "Lorekeeper",
      description: "Read for 45 consecutive minutes without touching your phone. Honor system — do you dare?",
      xpReward: 80,
      createdAt: new Date(Date.now() - 7200000),
      recipients: {
        create: {
          id: "rr-2",
          recipientId: "u-000",
          status: "pending",
        }
      }
    },
    {
      id: "ch-3",
      senderId: "u-3",
      categoryId: "c2",
      title: "The Cold Plunge",
      description: "Take a full cold shower for at least 2 minutes. Emerge victorious.",
      xpReward: 200,
      createdAt: new Date(Date.now() - 86400000),
      expiresAt: new Date(Date.now() + 86400000),
      recipients: {
        create: {
          id: "rr-3",
          recipientId: "u-000",
          status: "accepted",
        }
      }
    }
  ];

  for (const ch of challenges) {
    // Delete existing recipients for this challenge to avoid conflicts during upsert-like behavior
    await prisma.challengeRecipient.deleteMany({ where: { challengeId: ch.id } });
    
    await prisma.challenge.upsert({
      where: { id: ch.id },
      update: {
        ...ch,
        recipients: undefined // Handled by create/deleteMany
      },
      create: ch,
    });
  }
  console.log("Challenges seeded.");

  console.log("Mock data seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
