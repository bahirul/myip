export default {
    /**
     * Application configuration section
     * 
     * @param env: string - environment mode of the application (development | production)
     * @param port: number - port number of the application
     * @param host: string - host of the application
     */
    env: 'development',
    port: 51000,
    host: 'localhost',
    errorOnUndefinedIp: false, // return error (400) if the IP is private or not detected
    prettyOutput: true, // return pretty output
    trustProxy: true, // trust the reverse proxy

    /**
     * winston logging configuration
     *
     * @param level: string - logging level (error, warn, info, http, verbose, debug, silly)
     */
    winston: {
        level: 'debug',
    },
}