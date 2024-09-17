import { Request, Response } from "express";
import Jsend from "../helpers/jsend";

/**
 * Not found middleware to handle all not found requests
 * 
 * @param {Request} req
 * @param {Response} res
 * 
 * @returns {Response}
 */
const notFoundMiddleware = (req: Request, res: Response): Response => {
    return res.status(404).send(Jsend.error({
        message: "resource not found",
        code: 404
    }));
};

export default notFoundMiddleware;