import { Router } from "express";
import * as authController from "./auth.controller.js";
import { validate } from "../../middleware/validation.middleware.js";
import { registerSchema, loginSchema } from "./auth.schema.js";
import { protect } from "../../middleware/auth.middleware.js";
import { authLimiter } from "../../middleware/ratelimit.middleware.js";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.get("/me", protect, authController.getMe);
router.get("/users", protect, authController.getUsers);

export default router;