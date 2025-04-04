import { FC } from "react";

import { EditInfoForm } from "@/forms/EditInfoForm";
import { IMapUnitInfo } from "@/global";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "../ui/dialog";

interface IEditUserInfoProps {
  children: React.ReactNode;
  address: string;
  info: IMapUnitInfo | string;
}

export const EditUserInfoDialog: FC<IEditUserInfoProps> = ({ children, info }) => (
  <Dialog>
    <DialogTrigger asChild>{children}</DialogTrigger>
    <DialogContent className="z-50">
      <DialogHeader />

      <EditInfoForm
        unitData={{
          type: "user",
          info,
        }}
      />
    </DialogContent>
  </Dialog>
);

