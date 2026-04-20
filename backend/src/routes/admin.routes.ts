import { Router } from "express";
import {
    handleDeleteChallenge,
    handleDeleteUser,
    handleGetUserDetail,
    handleListUsers,
    handleUpdateUserXp
} from "../controllers/admin.controller";
import { requireAdmin } from "../middleware/admin.middleware";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// All admin routes require authentication and admin role
router.use(requireAuth);
router.use(requireAdmin);

// User management
router.get("/users", handleListUsers);
router.get("/users/:userId", handleGetUserDetail);
router.patch("/users/:userId", handleUpdateUserXp);
router.delete("/users/:userId", handleDeleteUser);

// Challenge management
router.delete("/challenges/:challengeId", handleDeleteChallenge);

export default router;
