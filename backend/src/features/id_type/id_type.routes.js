import { Router } from "express";
import * as idTypeController from "./id_type.controller.js";

const router = Router();

router.get("/", idTypeController.getIdType);
router.post("/", idTypeController.createIdType);
router.put("/:id", idTypeController.updateIdType);
router.delete("/:id", idTypeController.deleteIdType);

export default router;
