import { FC } from "react";

import { SetupMainPlotForm } from "@/forms/SetupMainPlotForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

interface ISetUserMainPlotDialogProps {
  children: React.ReactNode;
  plotNum?: number;
}

export const SetUserMainPlotDialog: FC<ISetUserMainPlotDialogProps> = ({ children, plotNum }) => (
  <Dialog>
    <DialogTrigger asChild>{children}</DialogTrigger>
    <DialogContent className="z-50">
      <DialogHeader>
        <DialogTitle>Set up main plot</DialogTitle>
      </DialogHeader>
      <SetupMainPlotForm plotNum={plotNum} />
    </DialogContent>
  </Dialog>
);

