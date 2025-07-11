import { addNotifications, useSettingsStore } from "@/store/settings-store";

import appConfig from "@/appConfig";
import { NotificationText } from "@/components/ui/_notification-text";
import { IPlot } from "@/global";
import { toast } from "@/hooks/use-toast";
import { useAaStore } from "@/store/aa-store";
import { isEmpty } from "lodash";

const showLogs = !!appConfig.TESTNET;

export const aaResponseHandler = (err: string | null, result: any) => {
  if (err && showLogs) console.error("log: aaResponseHandler error", err, result);
  if (err) return null;

  if (showLogs) console.log("log: aaResponseHandler", err, result);

  const { body } = result[1];
  const { updatedStateVars, response, timestamp } = body;
  let event = response.responseVars?.event ?? null;
  let events = response.responseVars?.events ?? null;

  const { governanceAa, walletAddress } = useSettingsStore.getState();
  const { state, loaded } = useAaStore.getState();

  if (!loaded) return;

  try {
    if (event) {
      event = JSON.parse(event);
    }

    if (events) {
      events = JSON.parse(events);
    }

    if (event && event.type === "allocate" && event.x !== undefined && event.y !== undefined) { // new plot allocation
      const unit = state[`plot_${event.plot_num}`] as IPlot | undefined;

      if (unit) {
        if (unit.owner === walletAddress) {
          addNotifications([
            {
              ts: timestamp,
              type: "new_plot",
              unitNumber: event.plot_num,
            },
          ]);


          toast({
            title: "New plot",
            description: <NotificationText type="new_plot" ts={timestamp} unitNumber={event.plot_num} />,
            duration: 10000
          });
        } else {
          console.warn("log: allocate event for plot owned by another user", event.plot_num, unit.owner, walletAddress);
        }
      } else {
        console.warn("log: allocate event for non-existing plot", event.plot_num);
      }
    } else if (events) {
      const houseEvent = events.find((e: any) => e.type === "house" && e.owner === walletAddress);
      if (houseEvent) {
        addNotifications([
          {
            ts: timestamp,
            type: "new_house",
            unitNumber: houseEvent.house_num
          },
        ]);

        toast({
          title: "New house",
          description: <NotificationText type="new_house" ts={timestamp} unitNumber={houseEvent.house_num} />,
          duration: 10000
        });
      }
    }

  } catch (error) {
    console.error("Failed to parse event:", error);
  }

  console.log('response', response);
  console.log('event', event);


  const diff: object = {};
  const governanceDiff: object = {};

  if (updatedStateVars) {
    for (const address in updatedStateVars) {
      for (const var_name in updatedStateVars[address]) {
        if (address === governanceAa) {

          // @ts-ignore
          governanceDiff[var_name] = updatedStateVars[address][var_name].value;
        } else if (address === appConfig.AA_ADDRESS) {
          // @ts-ignore
          diff[var_name] = updatedStateVars[address][var_name].value;
        }
      }
    }
  }

  if (!isEmpty(governanceDiff)) {
    if (showLogs) console.log("log: governance UPDATE", governanceDiff);
    // @ts-ignore
    useAaStore.getState().updateState("governance", governanceDiff);
  }

  if (!isEmpty(diff)) {
    if (showLogs) console.log("log: main aa UPDATE", diff);
    // @ts-ignore
    useAaStore.getState().updateState("main", diff);
  }
};

