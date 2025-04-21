import { aaRequestHandler } from "./events/aaRequestHandler";
import client from "./services/obyteWsClient";
import { initializeStore } from "./store/aa-store";
import { initializeSettings } from "./store/settings-store";

export const bootstrap = async () => {
  await initializeStore();
  await initializeSettings();

  client.subscribe((err: string | null, result: any) => {
    if (err) return null;
    const { subject } = result[1];

    if (subject === "light/aa_request") {
      aaRequestHandler(err, result);
    } else if (subject === "light/aa_response") {
      // aaResponseHandler(err, result);
    }
  });

  console.log("log: bootstrap done");
};

