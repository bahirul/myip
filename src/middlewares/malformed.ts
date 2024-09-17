import { NextFunction, Request, Response } from "express";
import Jsend from "../helpers/jsend";
import config from "../config/main";

interface MalformedError extends Error {
    expose: boolean;
    statusCode: number;
    status: number,
    body: string;
    type: string;
}

/**
 * Malformed middleware to handle malformed requests
 * 
 * @param {MalformedError} err 
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 * 
 * @returns {Response} 
 * @returns {NextFunction}
 */
const malformedMiddleware = (err: MalformedError, req: Request, res: Response, next: NextFunction): void => {
     // body-parser will set this to 400 if the json is in error
     if (err.statusCode === 400) {
        res.send(Jsend.error(
            {
                message: "malformed request",
                code: 400,
                data: config.env === "development" ? {
                    error: err.name,
                    stack: err.stack ? err.stack.split("\n") : []
                } : {}
            }
        ));

        return;
    }

    next(err); // if it's not a 400, let the default error handling do it.
};

export default malformedMiddleware;