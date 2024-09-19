import { Router } from "express";
import Jsend from "../helpers/jsend";
import validator from 'validator';
import { execSync } from 'child_process';
import config from '../config/main';
import { performance } from "perf_hooks";
import NodeCache from "node-cache";
import logger from "../utils/logger";

const nodeCache = new NodeCache({ stdTTL: 14 * 24 * 60 * 60, checkperiod: (14 * 24 * 60 * 60) + 30 });
const router = Router();

const parseWhois = (whoisOutput: string): Record<string, string> => {
    const lines = whoisOutput.split("\n").filter((x) => x.trim() !== "");
    const result: Record<string, string> = {};
    const formatKey = (key: string): string => {
        return key.toLowerCase().replace(" ", "_");
    };

    if(lines.length === 2) {
        const key = lines[0].split("|").map((x) => x.trim());
        const value = lines[1].split("|").map((x) => x.trim());

        for (let i = 0; i < key.length; i++) {
            result[formatKey(key[i])] = value[i];
        }
    }

    return result;
}

router.get("/", async (req, res) => {
    const startTime = performance.now();

    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress) as string;
    
    let type: string | null = null;

    if (validator.isIP(ip, 4)) {
        type = "ipv4";
    }

    if (validator.isIP(ip, 6)) {
        type = "ipv6";
    }

    // if no ip address is found
    if (type === null) {
        if (config.errorOnUndefinedIp === true) {
            return res.status(400).json(Jsend.fail({
                message: "no ip address detected"
            }));
        }

        return res.json(Jsend.success({
            ip: null,
            type: null,
            as: null,
            cc: null,
            registry: null,
            org: null,
            timeTaken: `${(performance.now() - startTime).toFixed(2)}ms`
        }));
    }

    const cacheQuery = nodeCache.get(ip);

    let whoisOutput: Record<string, string> = {};

    if (cacheQuery === undefined) {
        logger.info(`Cache MISS for IP: ` + ip);
        const whoisCmd = `whois -h bgp.tools " -v ${ip}"`;
        whoisOutput = parseWhois(execSync(whoisCmd).toString());
        nodeCache.set(ip, whoisOutput);
    } else {
        logger.info(`Cache HIT for IP: ` + ip);
        whoisOutput = cacheQuery as Record<string, string>;
    }
    
    return res.json(Jsend.success({
        ip: ip,
        type: type,
        as: whoisOutput.as,
        cc: whoisOutput.cc,
        registry: whoisOutput.registry,
        org: whoisOutput.as_name,
        timeTaken: `${(performance.now() - startTime).toFixed(2)}ms`
    }));
});

export default router;