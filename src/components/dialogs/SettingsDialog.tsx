import { FC } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

interface ISellPlotDialogProps {
  children: React.ReactNode;
}

export const SettingsDialog: FC<ISellPlotDialogProps> = ({ children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="z-50">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="shortcode" className="w-full">
          <TabsList className="flex justify-between w-full">
            <TabsTrigger className="w-[50%]" value="shortcode">
              Shortcode
            </TabsTrigger>
            <TabsTrigger className="w-[50%]" value="edit">
              Edit information
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shortcode">Shortcode</TabsContent>
          <TabsContent value="edit">Change info</TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

