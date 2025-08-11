import appConfig from '@/appConfig';
import { isbot } from "isbot";
import obyte from "obyte";

const client = !isbot(navigator.userAgent) ? new obyte.Client(`wss://obyte.org/bb${appConfig.TESTNET ? "-test" : ""}`, {
  testnet: !!appConfig.TESTNET,
  reconnect: true,
}) : undefined;

if (client) {
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
  });
}

export default client;
