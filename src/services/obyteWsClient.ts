import appConfig from '@/appConfig';
import obyte from "obyte";

import { bootstrap } from "@/bootstrap";

let heartbeat: ReturnType<typeof setInterval>;

const client = new obyte.Client(`wss://obyte.org/bb${appConfig.TESTNET ? "-test" : ""}`, {
  testnet: !!appConfig.TESTNET,
  reconnect: true,
});

client.onConnect(() => {
  if (heartbeat) clearInterval(heartbeat);

  // Set up heartbeat mechanism to keep the connection alive
  heartbeat = setInterval(function () {
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

