import { NextFunction, Request, Response } from "express";
import Jsend from "../helpers/jsend";
import logger from "../utils/logger";
import config from "../config/main";

/**
 * Error middleware to handle all errors
 * 
 * @param {Error} err 
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} _next
 * 
 * @returns {Response}
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorMiddleware = (err: Error, req: Request, res: Response, _next: NextFunction): Response => {
    // Log the error
    if (config.env === "development") {
        logger.error(err.stack);

        return res.status(500).send(Jsend.error({
            message: err.message,
            code: 500,
            data: {
                error: err.name,
                stack: err.stack ? err.stack.split("\n") : []
            }
        }));
    }

    return res.status(500).send(Jsend.error({
        message: "internal server error",
        code: 500
    }));
};

export default errorMiddleware;