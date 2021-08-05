class Ping {
    constructor(callback) {
        this.socket = new WebSocket("wss://connect.jacob.workers.dev/ws");
        this.interval = null;
        this.data = [];
        this.callback = callback;
    }

    start() {
        const self = this;
        this.data = [];
        if (!this.interval) {
            this.interval = setInterval(async () => {
                const result = await self.ping();
                self.data.push(result);
                console.log(result);
                self.callback(result, self.data);
            }, 1000);
        }
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    ping() {
        const self = this;
        return new Promise((r) => {
            const start = Date.now();
            self.socket.addEventListener(
                "message",
                (event) => {
                    const end = Date.now();
                    const server = JSON.parse(event.data);
                    r({
                        time: start,
                        latency: end - start,
                    });
                },
                { once: true }
            );
            self.socket.send(JSON.stringify({ date: start }));
        });
    }
}
