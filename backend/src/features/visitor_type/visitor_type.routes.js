import { Router } from "express";
import * as visitorTypeController from "./visitor_type.controller.js";

const router = Router();

router.get("/", visitorTypeController.getVisitorType);
router.post("/", visitorTypeController.createVisitorType);
router.put("/:id", visitorTypeController.updateVisitorType);
router.delete("/:id", visitorTypeController.deleteVisitorType);

export default router;
