import obyte from "obyte-http-client";

import appConfig from "@/appConfig";

export default new obyte.Client({
  testnet: !!appConfig.TESTNET,
  hubAddress: appConfig.TESTNET ? "https://testnet.obyte.org/api" : "https://obyte.org/api"
});