var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    default: mod
  };
};
import logger_utils_1 from "../utils/logger.utils.js";
const SENSITIVE_KEYS = ["password", "currentPassword", "newPassword", "token", "accessToken", "refreshToken", "secret", "apiKey", "authorization", "otp"];
const shouldMask = key => {
  const keyLower = key.toLowerCase();
  return SENSITIVE_KEYS.some(k => keyLower.includes(k.toLowerCase()));
};
const sanitizeBody = value => {
  if (Array.isArray(value)) return value.map(sanitizeBody);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = shouldMask(key) ? "***" : sanitizeBody(nested);
    }
    return out;
  }
  return value;
};
const errorHandler = (err, req, res, next) => {
  // ─── Default values ────────────────────────────────────────────────────────
  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || "SERVER_ERROR";
  let message = err.message || "Something went Wrong";
  let errors = [];
  // ─── Prisma: duplicate key ──────────────────
  if (err.code === "P2002") {
    statusCode = 409;
    errorCode = "CONFLICT";
    const target = err.meta?.target;
    message = `${target ? target : 'Field'} already in use`;
  }

  // ─── Prisma: validation / not found ────────────────────────────────────────────
  if (err.name === "PrismaClientValidationError") {
    statusCode = 400;
    errorCode = "VALIDATION_ERROR";
    message = "Validation Failed";
  }

  // ─── Prisma: Record Not Found ────────────────────────────────────────────
  if (err.code === "P2025") {
    statusCode = 404;
    errorCode = "NOT_FOUND";
    message = "Resource not found";
  }
  // ─── JWT: expired token ────────────────────────────────────────────────────
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    errorCode = "TOKEN_EXPIRED";
    message = "Access token expired";
  }
  // ─── Zod: validation error ─────────────────────────────────────────────────
  if (err.name === "ZodError") {
    err.isOperational = true;
    statusCode = 400;
    errorCode = "VALIDATION_ERROR";
    message = "Validation failed";
    errors = err.issues.map(e => ({
      field: e.path.join("."),
      message: e.message
    }));
  }
  // ─── Log Errors ────────────────────────────────────────────────────────────
  const routeInfo = `${req.method} ${req.originalUrl}`;
  if (!err.isOperational) {
    logger_utils_1.error("─────────────────────────────────────");
    logger_utils_1.error("UNEXPECTED ERROR");
    logger_utils_1.error(`Route  : ${routeInfo}`);
    logger_utils_1.error(`Message: ${err.message}`);
    logger_utils_1.error(`Stack  : ${err.stack}`);
    logger_utils_1.error(`Body   : ${JSON.stringify(sanitizeBody(req.body))}`);
    logger_utils_1.error("─────────────────────────────────────");
  } else {
    logger_utils_1.warn("─────────────────────────────────────");
    logger_utils_1.warn("⚠️  OPERATIONAL ERROR");
    logger_utils_1.warn(`Route   : ${routeInfo}`);
    logger_utils_1.warn(`Status  : ${statusCode}`);
    logger_utils_1.warn(`Code    : ${errorCode}`);
    logger_utils_1.warn(`Message : ${message}`);
    if (req.user?.userId) logger_utils_1.warn(`UserId  : ${req.user.userId}`);
    if (errors.length > 0) {
      logger_utils_1.warn(`Fields  : ${errors.map(e => `${e.field} → ${e.message}`).join(", ")}`);
    }
    logger_utils_1.warn("─────────────────────────────────────");
  }
  // ─── Send response ─────────────────────────────────────────────────────────
  const response = {
    success: false,
    errorCode,
    message
  };
  if (errors.length > 0) {
    response.errors = errors;
  }
  res.status(statusCode).json(response);
};
export default errorHandler;