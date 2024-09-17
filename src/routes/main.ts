import { Router } from "express";
import Jsend from "../helpers/jsend";
import validator from 'validator';
import { execSync } from 'child_process';
import config from '../config/main';
import { performance } from "perf_hooks";

const router = Router();

const parseWhois = (whoisOutput: string): Record<string, string> => {
    const lines = whoisOutput.split("\n");
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
    if (type == "ipv4" && (
        ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("172.16.") ||
        ip.startsWith("172.17.") || ip.startsWith("172.18.") || ip.startsWith("172.19.") ||
        ip.startsWith("172.20.") || ip.startsWith("172.21.") || ip.startsWith("172.22.") ||
        ip.startsWith("172.23.") || ip.startsWith("172.24.") || ip.startsWith("172.25.") ||
        ip.startsWith("172.26.") || ip.startsWith("172.27.") || ip.startsWith("172.28.") ||
        ip.startsWith("172.29.") || ip.startsWith("172.30.") || ip.startsWith("172.31.") ||
        ip.startsWith("127."))
    ) {
        type = null;
    }

    // private ipv6 ranges
    if (type == "ipv6" && (ip.startsWith("fc00:") || ip.startsWith("fd00:") || ip.startsWith("fe80:") || ip.startsWith("::1"))) {
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

    const whoisCmd = `whois -h bgp.tools ${ip}`;
    const whoisExec = execSync(whoisCmd).toString();
    const whoisOutput = parseWhois(whoisExec);
    
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