// loading environment variables
import { config } from "./config.js";

// this module is used for text formatting and inspecting complex objects
import util from "util";

// this module enables logging to a MongoDB database.
import "winston-mongodb";

// createLogger : used to create new logger instance
// format : Provides utilities to format log messages.
// transports : Contains various transport mechanisms for logging.
import { createLogger, format, transports } from "winston";

//imports the path module to handle and manipulate file paths.
import path from "path";

// to interact with file system like check for directory existence and delete files
import fs from "fs";

// handles log file rotation based on time and provided configurations such as this will create a new log file every day
import DailyRotateFile from "winston-daily-rotate-file";

import { red, blue, yellow, green, magenta } from "colorette";

//to convert URL paths to file system paths.
import { fileURLToPath } from "url";
// to get the directory name from a file path.
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Utility function to colorize log levels
const colorizeLevel = (level) => {
  switch (level) {
    case "error":
      return red(level);
    case "info":
      return blue(level);
    case "warn":
      return yellow(level);
    default:
      return level;
  }
};

// Format for console logs
const consoleLogFormat = format.printf((info) => {
  const { level, message, timestamp, meta = {} } = info;

  const customLevel = colorizeLevel(level.toLowerCase());
  const customTimestamp = green(timestamp);
  const customMessage = message;

  const customMeta = util.inspect(meta, {
    showHidden: false,
    depth: null,
    colors: true,
  });

  return `${customLevel} [${customTimestamp}] ${customMessage}\n${magenta(
    "META"
  )} ${customMeta}\n`;
});

// Transport for console logging
const consoleTransport = () => {
  if (config.NODE_ENV === "development") {
    return [
      new transports.Console({
        level: "info",
        format: format.combine(format.timestamp(), consoleLogFormat),
      }),
    ];
  }
  return [];
};

// Format for file logs
const fileLogFormat = format.printf((info) => {
  const { level, message, timestamp, meta = {} } = info;

  const logMeta = {};

  for (const [key, value] of Object.entries(meta)) {
    if (value instanceof Error) {
      logMeta[key] = {
        name: value.name,
        message: value.message,
        trace: value.stack || "",
      };
    } else {
      logMeta[key] = value;
    }
  }

  const logData = {
    level: level.toUpperCase(),
    message,
    timestamp,
    meta: logMeta,
  };

  return JSON.stringify(logData, null, 4);
});

// Ensure the logs directory exists
const logsDir = path.join(__dirname, "../", "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Transport for daily file logging
const dailyRotateFileTransport = () => {
  return [
    new DailyRotateFile({
      filename: path.join(logsDir, "%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "info",
      format: format.combine(format.timestamp(), fileLogFormat),
      maxFiles: "4d", // Keep logs for 4 days
    }),
  ];
};

// // Transport for MongoDB logging
// const mongodbTransport = () => {
//   return [
//     new transports.MongoDB({
//       level: "info",
//       db: process.env.DATABASE_URL,
//       metaKey: "meta",
//       expireAfterSeconds: 3600 * 24 * 30, // 30 days
//       options: {
//         useUnifiedTopology: true,
//       },
//       collection: "application-logs",
//     }),
//   ];
// };

// Create the logger with all transports
export const logger = createLogger({
  defaultMeta: {
    meta: {},
  },
  transports: [...dailyRotateFileTransport(), ...consoleTransport()],
});
