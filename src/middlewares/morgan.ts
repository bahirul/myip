import morgan from 'morgan';
import logger from '../utils/logger';
import { Request } from 'express';
import config from '../config/main';

/**
 * create body token for morgan on development
 */
morgan.token('body', (req: Request): string => {
    return config.env === 'development' && Object.keys(req.body).length > 0 ? `- ${JSON.stringify(req.body)} -` : ''
});

const morganMiddleware = morgan(
    ':method :url :body :status :res[content-length] - :response-time ms',
    {
        stream: {
            write: (message: string) => logger.http(`🌏 ${message.trim()}`)
        }
    }
);

export default morganMiddleware;