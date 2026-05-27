var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    default: mod
  };
};
import express_rate_limit_1 from "express-rate-limit";
export const apiLimiter = (0, express_rate_limit_1)({
  windowMs: 15 * 60 * 1000,
  // 15 minutes
  max: 1000,
  // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
});
export const authLimiter = (0, express_rate_limit_1)({
  windowMs: 60 * 60 * 1000,
  // 1 hour window
  max: 10,
  // start blocking after 10 requests
  message: "Too many accounts created from this IP, please try again after an hour"
});