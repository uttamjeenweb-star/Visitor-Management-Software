import { Router } from "express";
import * as roleController from "./role.controller.js";
import { validate } from "../../middleware/validation.middleware.js";
import { createRoleSchema, updateRoleSchema } from "./role.schema.js";
import { protect, restrictTo } from "../../middleware/auth.middleware.js";

const router = Router();

// Only Super Admin can manage roles
router.use(protect);
// router.use(restrictTo("Super Admin")); // Temporarily commented if we don't have role seeds yet

router
  .route("/")
  .get(roleController.getRoles)
  .post(validate(createRoleSchema), roleController.createRole);

router
  .route("/:id")
  .get(roleController.getRoleById)
  .patch(validate(updateRoleSchema), roleController.updateRole)
  .delete(roleController.deleteRole);

export default router;
