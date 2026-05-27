import { Router } from "express";
import * as carryWithController from "./carry_with.controller.js";

const router = Router();

router.get("/", carryWithController.getCarryWith);
router.post("/", carryWithController.createCarryWith);
router.put("/:id", carryWithController.updateCarryWith);
router.delete("/:id", carryWithController.deleteCarryWith);

export default router;
