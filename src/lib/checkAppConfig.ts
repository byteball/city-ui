import appConfig from "@/appConfig";

export default () => {
  if (!appConfig.AA_ADDRESS) {
    throw new Error("AA_ADDRESS is not defined in env file");
  }

  if (!appConfig.MAP_SCALE || appConfig.MAP_SCALE > 1) {
    throw new Error("MAP_SCALE should be less than 1");
  }
};

