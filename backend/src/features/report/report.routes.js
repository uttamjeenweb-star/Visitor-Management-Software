import { Router } from "express";
import * as reportController from "./report.controller.js";

const router = Router();

router.get("/", reportController.getReport);

export default router;
