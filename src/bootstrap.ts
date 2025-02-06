import { initializeStore } from "./store/aa-store";
import { initializeSettings, setSelectedPlot } from "./store/settings-store";

export const bootstrap = async () => {
  await initializeStore();
  await initializeSettings();
  setSelectedPlot();
  console.log("log: bootstrap done");
};

