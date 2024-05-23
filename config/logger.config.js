import winston from "winston";
import dotenv from 'dotenv';
dotenv.config();

const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`)
);

const prodLogger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

const devLogger = winston.createLogger({
    level: 'debug',
    format: logFormat,
    transports: [
        new winston.transports.Console()
    ]
});

export const logger = process.env.NODE_ENV === 'production' ? prodLogger : devLogger;

process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}`, error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});


