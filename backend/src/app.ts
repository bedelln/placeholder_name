import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorHandler } from "./middleware/error.middleware";
import { notFoundHandler } from "./middleware/notFound.middleware";
import adminRoutes from "./routes/admin.routes";
import authRoutes from "./routes/auth.routes";
import challengeRoutes from "./routes/challenge.routes";
import friendshipRoutes from "./routes/friendship.routes";
import groupRoutes from "./routes/group.routes";
import healthRoutes from "./routes/health.routes";
import leaderboardRoutes from "./routes/leaderboard.routes";
import userRoutes from "./routes/user.routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friendships", friendshipRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/challenge-categories", challengeRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
