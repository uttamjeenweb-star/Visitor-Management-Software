var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    default: mod
  };
};
import * as zod_1 from "zod";
import appError_1 from "../utils/appError.js";
const validate = schema => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      return next();
    } catch (error) {
      if (error instanceof zod_1.ZodError) {
        const errorMessages = error.errors.map(issue => `${issue.path.join(".")} is ${issue.message}`);
        return next(new appError_1(`Validation Error: ${errorMessages.join(", ")}`, 400, "VALIDAION_ERROR"));
      }
      return next(new appError_1("Internal Server Error", 500, "SERVER_ERROR"));
    }
  };
};
export { validate };