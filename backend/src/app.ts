import cors from "cors";
import express from "express";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes";
import healthRoutes from "./routes/health.routes";
import userRoutes from "./routes/user.routes";
import { errorHandler } from "./middleware/error.middleware";
import { notFoundHandler } from "./middleware/notFound.middleware";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
