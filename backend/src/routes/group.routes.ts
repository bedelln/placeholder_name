import { Router } from "express";

import * as groupController from "../controllers/group.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", groupController.listGroups);
router.post("/", groupController.createGroup);
router.get("/:id", groupController.getGroup);
router.post("/:id/members", groupController.addGroupMembers);
router.patch("/:id", groupController.renameGroup);
router.delete("/:id/members/:memberUserId", groupController.removeGroupMember);

export default router;
