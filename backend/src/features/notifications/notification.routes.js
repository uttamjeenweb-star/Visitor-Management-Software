import { Router } from "express";
import * as notificationController from "./notification.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", notificationController.getMyNotifications);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);

export default router;
