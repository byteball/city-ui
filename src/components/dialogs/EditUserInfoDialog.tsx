import { FC } from "react";

import { EditInfoForm } from "@/forms/EditInfoForm";
import { IMapUnitInfo } from "@/global";
import {
  DialogWithConfirmationContent,
  DialogWithConfirmationHeader,
  DialogWithConfirmationStateProvider,
  DialogWithConfirmationTrigger,
} from "../ui/dialogWithConfirmation";

interface IEditUserInfoProps {
  children: React.ReactNode;
  address: string;
  info: IMapUnitInfo | string;
}

export const EditUserInfoDialog: FC<IEditUserInfoProps> = ({ children, info }) => (
  <DialogWithConfirmationStateProvider>
    <DialogWithConfirmationTrigger asChild>{children}</DialogWithConfirmationTrigger>
    <DialogWithConfirmationContent className="z-50">
      <DialogWithConfirmationHeader />

      <EditInfoForm
        unitData={{
          type: "user",
          info,
        }}
      />
    </DialogWithConfirmationContent>
  </DialogWithConfirmationStateProvider>
);

