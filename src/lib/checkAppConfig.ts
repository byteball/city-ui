import appConfig from "@/appConfig";

export default () => {
  if (!appConfig.AA_ADDRESS) {
    throw new Error("AA_ADDRESS is not defined in env file");
  }

  if (!appConfig.MAP_SCALE || appConfig.MAP_SCALE > 1) {
    throw new Error("MAP_SCALE should be less than 1");
  }

  if (!appConfig.LAUNCH_DATE) {
    throw new Error("LAUNCH_DATE is not defined in env file. It should be same as in the AA");
  } else {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(appConfig.LAUNCH_DATE)) {
      throw new Error("LAUNCH_DATE should be in YYYY-MM-DD format");
    }
  }
};

