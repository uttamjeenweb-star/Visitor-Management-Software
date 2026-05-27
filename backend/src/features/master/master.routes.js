import { Router } from "express";
import employeeRouter from "../employee/employee.routes.js";
import purposeRouter from "../purpose/purpose.routes.js";
import visitingAreaRouter from "../visiting_area/visiting_area.routes.js";
import carryWithRouter from "../carry_with/carry_with.routes.js";
import visitorTypeRouter from "../visitor_type/visitor_type.routes.js";
import departmentRouter from "../department/department.routes.js";
import locationRouter from "../location/location.routes.js";
import idTypeRouter from "../id_type/id_type.routes.js";
import companyRegisterRouter from "../company_register/company_register.routes.js";

const router = Router();

router.use("/employee", employeeRouter);
router.use("/purpose", purposeRouter);
router.use("/visiting-area", visitingAreaRouter);
router.use("/carry-with", carryWithRouter);
router.use("/visitor-type", visitorTypeRouter);
router.use("/department", departmentRouter);
router.use("/location", locationRouter);
router.use("/id-type", idTypeRouter);
router.use("/company-register", companyRegisterRouter);

export default router;