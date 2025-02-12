import { initializeStore } from "./store/aa-store";
import { initializeSettings } from "./store/settings-store";

export const bootstrap = async () => {
  await initializeStore();
  await initializeSettings();
  console.log("log: bootstrap done");
};

