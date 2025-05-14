import { useSettingsStore } from "@/store/settings-store";

import appConfig from "@/appConfig";
import { useAaStore } from "@/store/aa-store";
import { isEmpty } from "lodash";

const showLogs = !!appConfig.TESTNET;

export const aaResponseHandler = (err: string | null, result: any) => {
  if (err && showLogs) console.error("log: aaResponseHandler error", err, result);
  if (err) return null;

  if (showLogs) console.log("log: aaResponseHandler", err, result);

  const { body } = result[1];
  const { updatedStateVars } = body;

  const { governanceAa } = useSettingsStore.getState();

  const diff: object = {};
  const governanceDiff: object = {};

  if (updatedStateVars) {
    for (const address in updatedStateVars) {
      for (const var_name in updatedStateVars[address]) {
        if (address === governanceAa) {
          governanceDiff[var_name] = updatedStateVars[address][var_name].value;
        } else if (address === appConfig.AA_ADDRESS) {
          diff[var_name] = updatedStateVars[address][var_name].value;
        }
      }
    }
  }

  if (!isEmpty(governanceDiff)) {
    if (showLogs) console.log("log: governance UPDATE", governanceDiff);
    useAaStore.getState().updateState("governance", governanceDiff);
  }

  if (!isEmpty(diff)) {
    if (showLogs) console.log("log: main aa UPDATE", diff);
    useAaStore.getState().updateState("main", diff);
  }
};

