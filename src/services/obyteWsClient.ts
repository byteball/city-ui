import obyte from "obyte";

import { bootstrap } from "@/bootstrap";

const client = new obyte.Client(`wss://obyte.org/bb${true ? "-test" : ""}`, {
    testnet: true,
    reconnect: true,
});

client.onConnect(() => {
    // Set up heartbeat mechanism to keep the connection alive
    const heartbeat = setInterval(function () {
        client.api.heartbeat();
    }, 10 * 1000);

    // Clear heartbeat interval on WebSocket close
    // @ts-ignore
    client.client.ws.addEventListener("close", () => {
        clearInterval(heartbeat);
    });

    try {
        bootstrap();
    } catch (error) {
        console.error("Bootstrap failed:", error);
    }
});

export default client;

