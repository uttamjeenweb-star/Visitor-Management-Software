import { Router } from "express";
import * as locationController from "./location.controller.js";

const router = Router();

router.get("/", locationController.getLocation);
router.post("/", locationController.createLocation);
router.put("/:id", locationController.updateLocation);
router.delete("/:id", locationController.deleteLocation);

export default router;
