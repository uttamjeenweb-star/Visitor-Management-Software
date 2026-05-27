import { Router } from "express";
import * as employeeController from "./employee.controller.js";

const router = Router();

router.get("/", employeeController.getEmployee);
router.post("/", employeeController.createEmployee);
router.put("/:id", employeeController.updateEmployee);
router.delete("/:id", employeeController.deleteEmployee);

export default router;
