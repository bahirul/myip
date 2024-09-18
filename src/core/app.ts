import express, { Application }  from "express";
import config from "../config/main";
import bodyParser from "body-parser";
import cors from "cors";
import logger from "../utils/logger";
import morganMiddleware from "../middlewares/morgan";
import errorMiddleware from "../middlewares/error";
import notFoundMiddleware from "../middlewares/not-found";
import malformedMiddleware from "../middlewares/malformed";
import mainRoute from "../routes/main";

/**
 * App class to create and configure the express application
 * 
 * @class App
 */
class App {
    public app: Application;

    constructor() {
        this.app = express();
        this._registerMiddlewares();
    }

    private _registerMiddlewares() {
        // trust proxy
        if(config.trustProxy === true) {
            this.app.set("trust proxy", true);
        }

        this.app.use(morganMiddleware);
        this.app.use(bodyParser.json());
        this.app.use(cors());

        if(config.prettyOutput === true) {
            this.app.set("json spaces", 2);
        }

        this.app.use(malformedMiddleware);

        // Register routes
        this._registerRoutes();

        this.app.use(notFoundMiddleware);
        this.app.use(errorMiddleware);
    }

    private _registerRoutes() {
        this.app.get("/", mainRoute);
    }

    public start() {
        this.app.listen(config.port, () => {
            logger.info(`✅ server started at http://${config.host}:${config.port}`);
        });
    }
}

export default new App();