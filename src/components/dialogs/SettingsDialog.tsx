import { FC } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditInfoForm } from "@/forms/EditInfoForm";
import { ShortcodeForm } from "@/forms/ShortcodeForm";
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
      <DialogHeader />

      {unitData.type === "house" ? (
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="flex justify-between w-full">
            <TabsTrigger className="w-[50%]" value="info">
              Edit information
            </TabsTrigger>

            <TabsTrigger className="w-[50%]" value="shortcode">
              Shortcode
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shortcode">
            <div className="mt-8">
              <ShortcodeForm unitData={unitData} />
            </div>
          </TabsContent>
          <TabsContent value="info">
            <div className="mt-8">
              <EditInfoForm unitData={unitData} />
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <EditInfoForm unitData={unitData} />
      )}
    </DialogContent>
  </Dialog>
);

