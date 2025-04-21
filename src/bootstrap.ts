import { aaRequestHandler } from "./events/aaRequestHandler";
import { aaResponseHandler } from "./events/aaResponseHandler";

import { initializeStore } from "./store/aa-store";
import { initializeSettings } from "./store/settings-store";

import client from "./services/obyteWsClient";

export const bootstrap = async () => {
  await initializeStore();
  await initializeSettings();

  client.subscribe((err, result) => {
    if (err) {
      console.error("WebSocket error:", err);
      return;
    }

    const { subject } = result[1];

    switch (subject) {
      case "light/aa_request":
        aaRequestHandler(err, result);
        break;
      case "light/aa_response":
        aaResponseHandler(err, result);
        break;
    }
  });

  console.log("log: bootstrap done");
};

