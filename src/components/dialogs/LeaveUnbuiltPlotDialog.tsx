import { FC } from "react";

import { QRButton } from "../ui/_qr-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

interface ILeaveUnbuiltPlotDialog {
  children: React.ReactNode;
  leaveUrl: string;
}

export const LeaveUnbuiltPlotDialog: FC<ILeaveUnbuiltPlotDialog> = ({ children, leaveUrl }) => (
  <Dialog>
    <DialogTrigger asChild>{children}</DialogTrigger>
    <DialogContent className="z-50">
      <DialogHeader>
        <DialogTitle>Leave the unbuilt plot</DialogTitle>
      </DialogHeader>

      <p className="text-sm text-foreground">Are you sure you want to leave the unbuilt plot?</p>
      <QRButton href={leaveUrl}>Leave the unbuilt plot</QRButton>
    </DialogContent>
  </Dialog>
);

