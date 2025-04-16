import { FC } from "react";

import { SetupMainPlotForm } from "@/forms/SetupMainPlotForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

interface ISetUserMainPlotDialogProps {
  children: React.ReactNode;
  address: string;
  plotNum?: number;
}

export const SetUserMainPlotDialog: FC<ISetUserMainPlotDialogProps> = ({ children, plotNum, address }) => (
  <Dialog>
    <DialogTrigger asChild>{children}</DialogTrigger>
    <DialogContent className="z-50">
      <DialogHeader>
        <DialogTitle>Set up the main plot</DialogTitle>
      </DialogHeader>
      <SetupMainPlotForm plotNum={plotNum} address={address} />
    </DialogContent>
  </Dialog>
);

