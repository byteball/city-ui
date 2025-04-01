import { FC } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditInfoForm } from "@/forms/EditInfoForm";
import { IMapUnit } from "@/global";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "../ui/dialog";

interface ISettingsDialogProps {
  children: React.ReactNode;
  unitData: IMapUnit;
}

export const SettingsDialog: FC<ISettingsDialogProps> = ({ children, unitData }) => (
  <Dialog>
    <DialogTrigger asChild>{children}</DialogTrigger>
    <DialogContent className="z-50">
      <DialogHeader>{/* <DialogTitle>Settings</DialogTitle> */}</DialogHeader>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="flex justify-between w-full">
          <TabsTrigger className="w-[50%]" value="info">
            Edit information
          </TabsTrigger>

          <TabsTrigger disabled className="w-[50%]" value="shortcode">
            Shortcode (soon)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shortcode">{/* <ShortcodeForm unitData={unitData} /> */}</TabsContent>
        <TabsContent value="info">
          <EditInfoForm unitData={unitData} />
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
);

