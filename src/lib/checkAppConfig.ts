import appConfig from "@/appConfig";

export default () => {
  if (!appConfig.AA_ADDRESS) {
    throw new Error("AA_ADDRESS is not defined in env file");
  }
};

