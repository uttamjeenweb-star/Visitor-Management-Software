import { Router } from "express";
import * as companyRegisterController from "./company_register.controller.js";
import { uploadLogo } from "../../middleware/upload.js";

const router = Router();

router.get("/", companyRegisterController.getCompanyRegister);
router.put("/", uploadLogo.single("logo"), companyRegisterController.updateCompanyRegister);

export default router;
