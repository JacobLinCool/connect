import { Router } from "itty-router";
import { response } from "./response";
import parser from "ua-parser-js";

const router = Router();

router.get("/ws", async (request) => {
    const ws_pair = new WebSocketPair();
    const [client, server] = Object.values(ws_pair);
    server.accept();
    server.addEventListener("message", (event) => {
        if (event.data) {
            try {
                const { date } = JSON.parse(event.data);
                const now = Date.now();
                const ping = now - date;
                server.send(JSON.stringify({ date: Date.now(), ping: ping }));
            } catch (err) {
                server.send(JSON.stringify({ date: Date.now() }));
            }
        } else {
            server.send(JSON.stringify({ date: Date.now() }));
        }
    });

    return new Response(null, { status: 101, webSocket: client });
});

router.all("*", async (request) => {
    const { cf, headers, query } = request;
    const { browser, engine, os, device, cpu, ua } = parser(headers.get("User-Agent"));
    const resp = {
        client: {
            ip: headers.get("CF-Connecting-IP"),
            userAgent: ua,
            browser: browser,
            engine: engine,
            os: os,
            device: device,
            cpu: cpu,
            location: {
                continent: cf.continent,
                country: cf.country,
                region: cf.region,
                city: cf.city,
                longitude: cf.longitude,
                latitude: cf.latitude,
                asn: cf.asn,
                timezone: cf.timezone,
            },
        },
        server: {
            time: Date.now(),
            location: cf.colo,
            http: cf.httpProtocol,
            tls: {
                version: cf.tlsVersion,
                cipher: cf.tlsCipher,
            },
        },
    };
    return response({ data: JSON.stringify(resp, null, query.min ? 0 : 2) });
});

async function main() {
    addEventListener("fetch", (event) => {
        event.respondWith(router.handle(event.request));
    });

    addEventListener("scheduled", (event) => {
        event.waitUntil(handle_cron(event));
    });
}

export { main };
