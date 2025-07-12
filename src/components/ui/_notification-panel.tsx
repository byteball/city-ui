import { BellIcon, CheckCheckIcon, Inbox } from "lucide-react";
import moment from "moment";
import { memo } from "react";
import { Helmet } from "react-helmet-async";

import { clearAllNotifications, clearNotification, useSettingsStore } from "@/store/settings-store";

import { PopoverClose } from "@radix-ui/react-popover";
import { BellDotIcon } from "../icons/BellDotIcon";
import { NotificationText } from "./_notification-text";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ScrollArea } from "./scroll-area";

export const NotificationPanel = memo(() => {
  const notifications = useSettingsStore((state) => state.notifications);
  const haveNotifications = notifications.length > 0;

  return <>
    <Helmet>
      <link rel="icon" type="image/png" href={haveNotifications ? "/bell-dot.png" : "/favicon.png"} />
    </Helmet>

    <Popover>
      <PopoverTrigger asChild>
        <div>
          {haveNotifications
            ? <BellDotIcon className="w-5 h-5 cursor-pointer" />
            : <BellIcon className="w-5 h-5 cursor-pointer" />}
        </div>
      </PopoverTrigger>

      <PopoverContent align="center" className="mt-2 w-[330px]">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="pl-2 font-semibold leading-none text-white/90">Notifications <span className="text-muted-foreground">({notifications.length})</span></h4>
          </div>
          <div>
            {notifications.length === 0 ? <div className="flex flex-col items-center text-white/90">
              <div className="p-4 mb-4 rounded-full bg-slate-600/20">
                <Inbox className="w-8 h-8 mx-auto" />
              </div>

              <div className="text-muted-foreground">You've seen all the notifications</div>
            </div> : <ScrollArea type="auto" className="h-[240px] pr-4">
              {notifications.sort((a, b) => b.ts - a.ts).map((n) => (
                <div key={n.ts}
                  className="flex items-center justify-between gap-2 p-2 rounded-md select-none hover:bg-slate-600/20"
                >
                  <div className="flex flex-col justify-center">
                    <div className="text-sm text-white/90">
                      <NotificationText {...n} autoClose />
                    </div>
                    <div className="text-xs font-normal text-muted-foreground">{moment.unix(n.ts).toNow()}</div>
                  </div>
                  <PopoverClose asChild>
                    <CheckCheckIcon
                      className="w-5 h-5 cursor-pointer hover:stroke-white"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); clearNotification(n); }} />
                  </PopoverClose>
                </div>
              ))}
            </ScrollArea>}
          </div>
        </div>

        {notifications.length > 0
          ?
          <PopoverClose asChild>
            <Button variant="secondary" className="w-full mt-4" onClick={clearAllNotifications}>Clear all</Button>
          </PopoverClose>
          : null}
      </PopoverContent>
    </Popover>
  </>
});