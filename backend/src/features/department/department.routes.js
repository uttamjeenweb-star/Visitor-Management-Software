import { Router } from "express";
import * as departmentController from "./department.controller.js";

const router = Router();

router.get("/", departmentController.getDepartment);
router.post("/", departmentController.createDepartment);
router.put("/:id", departmentController.updateDepartment);
router.delete("/:id", departmentController.deleteDepartment);

export default router;
