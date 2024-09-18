import { Router } from "express";
import Jsend from "../helpers/jsend";
import validator from 'validator';
import { execSync } from 'child_process';
import config from '../config/main';
import { performance } from "perf_hooks";
import NodeCache from "node-cache";

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

router.get("/", (req, res) => {
    const startTime = performance.now();

    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress) as string;
    let type: string | null = null;

    if (validator.isIP(ip, 4)) {
        type = "ipv4";
    }

    if (validator.isIP(ip, 6)) {
        type = "ipv6";
    }

    // private ipv4 ranges
    const ipv4PrivateRanges = [
        "10.",
        "192.168.",
        "172.16.",
        "172.17.",
        "172.18.",
        "172.19.",
        "172.20.",
        "172.21.",
        "172.22.",
        "172.23.",
        "172.24.",
        "172.25.",
        "172.26.",
        "172.27.",
        "172.28.",
        "172.29.",
        "172.30.",
        "172.31.",
        "127."
    ];

    
    if (type == "ipv4" && ipv4PrivateRanges.some((x) => ip.startsWith(x))) {
        type = null;
    }

    // private ipv6 ranges
    const ipv6PrivateRanges = [
        "fc00:",
        "fd00:",
        "fe80:",
        "::1"
    ];

    if (type == "ipv6" && ipv6PrivateRanges.some((x) => ip.startsWith(x))) {
        type = null;
    }

    // if no ip address is found
    if (type === null) {
        if (config.errorOnUndefinedIp === true) {
            return res.status(400).json(Jsend.fail({
                message: "no public ip address detected"
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

    const nodeCache = new NodeCache({ stdTTL: 30 * 24 * 60 * 60, checkperiod: (30 * 24 * 60 * 60) + 60 });
    const cacheQuery = nodeCache.get(ip);

    const whoisCmd = `whois -h bgp.tools ${ip}`;
    const whoisOutput = cacheQuery === undefined ? parseWhois(execSync(whoisCmd).toString()) : cacheQuery as Record<string, string>;
    
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