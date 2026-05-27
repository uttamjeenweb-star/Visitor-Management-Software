import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from "express";
import env from "./config/env.js";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import logger from "./utils/logger.utils.js";
import { initSocket } from "./socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  logger.error(err.name, err.message);
  process.exit(1);
});

connectDB();

app.use("/uploads", express.static(join(__dirname, "../uploads")));

const port = env.PORT || 5000;
const server = app.listen(port, () => {
  logger.info(`App running on port ${port}...`);
  console.log(`App running on port ${port}...`);
});

// Initialize Socket.io
initSocket(server);

process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION! 💥 Shutting down...");
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});