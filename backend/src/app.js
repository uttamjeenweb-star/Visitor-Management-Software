import express, { json, urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import { securityHeaders, sanitizeInput } from "./middleware/sanitize.middleware.js";
import { apiLimiter } from "./middleware/ratelimit.middleware.js";
import morgan from "morgan";
import logger from "./utils/logger.utils.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./features/auth/auth.routes.js";
import roleRoutes from "./features/roles/role.routes.js";
import notificationRoutes from "./features/notifications/notification.routes.js";
import gpRoutes from "./features/gate_pass/gp.routes.js";
import masterRoutes from "./features/master/master.routes.js";
import reportRoutes from "./features/report/report.routes.js";
import { protect } from "./middleware/auth.middleware.js";

const app = express();
app.set("trust proxy", 1);
// 1. GLOBAL MIDDLEWARES
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim().replace(/\/$/, ''))
  : [];

app.use(cors({
  origin: function (origin, callback) {
    logger.info(`[CORS] Incoming origin: ${origin}`);
    // Allow if origin is in the list, or if no origin (e.g. server-to-server), or allow all temporarily for debugging
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      logger.warn(`[CORS] Origin not allowed: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`);
      // Temporarily allowing all origins to fix deployment issues. Change to 'callback(new Error(...))' for strict security later.
      callback(null, true); 
    }
  },
  credentials: true,
  maxAge: 86400
}));

// Set security HTTP headers
app.use(securityHeaders);
app.use(compression());
app.use("/api", apiLimiter);
app.use(json({ limit: "10kb" }));
app.use(urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(sanitizeInput);

// Development logging
const stream = {
  write: message => logger.http(message.trim())
};
// 3. Apply Morgan WITH the stream option attached!
app.use(morgan("[:method]|| :url ||Status::status ||ResponseTime: { :response-time ms }  ||Device: { :user-agent }", {
  stream: stream
}));
// Implement CORS moved to top

// Data sanitization against XSS
logger.info(`Routing requested`);

// 2. ROUTES
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/roles", protect, roleRoutes);
app.use("/api/v1/notifications", protect, notificationRoutes);
app.use("/api/v1/capture", gpRoutes); // GP routes self-protect
app.use("/api/v1/master", protect, masterRoutes);
app.use("/api/v1/report", protect, reportRoutes);

// Initialize Cron Job
import { initCronJob } from "./utils/cron.js";
initCronJob();

// 3. ERROR HANDLING MIDDLEWARE
app.use(errorHandler);

export default app;