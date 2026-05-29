import winston_1 from "winston"; // custom format
const customFormat = winston_1.format.printf(({
  timestamp,
  level,
  message
}) => {
  return `${level}: ${message} - { ${timestamp} }`;
});
const logger = winston_1.createLogger({
  // In development, log everything ('debug' and up). In prod, log 'info' and up.
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston_1.format.combine(winston_1.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss A"
  })),
  transports: [
  // 1. Console (With Colors & Custom Format)
  new winston_1.transports.Console({
    format: winston_1.format.combine(winston_1.format.colorize({
      all: true
    }),
    // Colorize the whole line
    customFormat // Use your custom layout
    )
  }),
  // 2. Files (No Colors, otherwise text files get weird symbols like \x1b[32m)
  new winston_1.transports.File({
    filename: "./src/logs/error.log",
    level: "error",
    format: customFormat
  }), new winston_1.transports.File({
    filename: "./src/logs/combined.log",
    format: customFormat
  })]
});
export default logger;