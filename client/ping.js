const socket = new WebSocket("wss://connect.jacob.workers.dev/ws");

function ping() {
    return new Promise((r) => {
        const start = Date.now();
        socket.addEventListener(
            "message",
            (event) => {
                const end = Date.now();
                const server = JSON.parse(event.data);
                r({
                    latency: end - start,
                    c2s: server.ping,
                    s2c: end - start - server.ping,
                });
            },
            { once: true }
        );
        socket.send(JSON.stringify({ date: start }));
    });
}

const ping_interval = setInterval(async () => {
    const result = await ping();
    console.log(result);
}, 1000);
