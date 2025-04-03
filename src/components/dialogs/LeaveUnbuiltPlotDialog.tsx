import { FC } from "react";

import { toLocalString } from "@/lib";
import { useSettingsStore } from "@/store/settings-store";
import { QRButton } from "../ui/_qr-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

interface ILeaveUnbuiltPlotDialog {
  children: React.ReactNode;
  leaveUrl: string;
  amount: number;
}
export const LeaveUnbuiltPlotDialog: FC<ILeaveUnbuiltPlotDialog> = ({ children, leaveUrl, amount = 0 }) => {
  const { symbol, decimals } = useSettingsStore();

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="z-50">
        <DialogHeader>
          <DialogTitle>Leave the unbuilt plot</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-yellow-600 text-foreground">Are you sure you want to leave the unbuilt plot?</p>
          <p className="text-sm text-foreground">
            You will receive{" "}
            <b>
              {toLocalString(amount / 10 ** decimals!)} {symbol}
            </b>{" "}
            for this unbuilt plot.
          </p>
        </div>

        <QRButton href={leaveUrl}>Leave plot</QRButton>
      </DialogContent>
    </Dialog>
  );
};

