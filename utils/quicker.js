import os from "os";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import { config } from "../config/config.js";

export default {
  getSystemHealth: () => {
    return {
      cpuUsage: os.loadavg(),
      totalMemory: `${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`,
      freeMemory: `${(os.freemem() / 1024 / 1024).toFixed(2)} MB`,
    };
  },
  getApplicationHealth: () => {
    return {
      environment: config.NODE_ENV,
      uptime: `${process.uptime().toFixed(2)} Second`,
      memoryUsage: {
        heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(
          2
        )} MB`,
        heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
          2
        )} MB`,
      },
    };
  },
  getDatabaseHealth: () => {
    return {
      connected: mongoose.connection.readyState === 1,
    };
  },
};
