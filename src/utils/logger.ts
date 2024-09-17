import winston from "winston";
import config from "../config/main";
import { PathMapper } from "../helpers/path-mapper";

const { combine, timestamp, printf } = winston.format;

winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    verbose: 'cyan',
    debug: 'blue',
    silly: 'white'
});

const logger = winston.createLogger({
    level: config.winston.level,
    format: combine(
        timestamp(),
        winston.format.colorize(),
        printf(({ level, message, timestamp }) => {
            return `${timestamp} [${level}]: ${message}`;
        }),
    ),
    transports: [
        new winston.transports.Console({
            format: combine(
                timestamp(),
                winston.format.colorize(),
                printf(({ level, message, timestamp }) => {
                    return `${timestamp} [${level}]: ${message}`;
                }),
            )
        }),
        new winston.transports.File({ filename: PathMapper.resolve("@logs/error.log"), level: "error" }),
        new winston.transports.File({ filename: PathMapper.resolve("@logs/combined.log") }),
    ]
});

export default logger;