import { isArray, isObject, unionBy } from "lodash";
import { Plus, X } from "lucide-react";
import { FC, useState } from "react";

import { QRButton } from "@/components/ui/_qr-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useSettingsStore } from "@/store/settings-store";

import { IMapUnit } from "@/global";
import { generateLink } from "@/lib";

import appConfig from "@/appConfig";

interface EditInfoFormProps {
  unitData: IMapUnit;
  onSubmit?: (info: any) => void;
}

type TInfoType = "string" | "object";

export const EditInfoForm: FC<EditInfoFormProps> = ({ unitData }) => {
  const { info, type, plot_num } = unitData;
  const walletAddress = useSettingsStore((state) => state.walletAddress!);

  const infoType: TInfoType = isObject(info) ? "object" : "string";

  const [newInfo, setNewInfo] = useState<Array<Record<string, any>>>(
    isObject(info) && infoType === "object"
      ? Object.entries(info).map(([key, value]) => ({
          key,
          value,
        }))
      : [{ key: "", value: info }]
  );

  const handleObjectKeyChange = (index: number, value: string) => {
    if (isArray(newInfo)) {
      const updatedInfo = [...newInfo];
      updatedInfo[index].key = value;
      setNewInfo(updatedInfo);
    }
  };

  const handleObjectValueChange = (index: number, value: string) => {
    if (isArray(newInfo)) {
      const updatedInfo = [...newInfo];
      updatedInfo[index].value = value;
      setNewInfo(updatedInfo);
    }
  };

  const addObjectField = () => {
    if (isArray(newInfo)) {
      setNewInfo([...newInfo, { key: "", value: "" }]);
    }
  };

  const removeObjectField = (index: number) => {
    if (isArray(newInfo)) {
      const updatedInfo = [...newInfo];
      updatedInfo.splice(index, 1);
      setNewInfo(updatedInfo);
    }
  };

  // Convert array of key-value pairs back to object
  let obj = newInfo.reduce((acc, { key, value }) => {
    if (key) {
      acc[key] = value;
    }

    return acc;
  }, {} as Record<string, any>);

  // And then convert to JSON string
  let objString = JSON.stringify(obj);

  const areAllUniq = unionBy(newInfo, "key").length === newInfo.length;

  const url = generateLink({
    amount: 10000,
    data: {
      ...(type === "house" ? { house_num: unitData.house_num } : { plot_num }),
      info: objString,
      edit_plot: 1,
    },
    from_address: walletAddress,
    aa: appConfig.AA_ADDRESS,
    asset: "base",
    is_single: true,
  });

  const emptyFields = newInfo.filter((item) => !item.key || !item.value);

  return (
    <div className="mt-8 space-y-4 ">
      <div className="mb-6">
        <h3 className="text-lg font-medium">Edit Information</h3>
        <p className="text-sm text-muted-foreground">
          You can edit the information here, which will be publicly published and linked to this {unitData.type}.
        </p>
      </div>

      <div className="space-y-3">
        {newInfo.length > 0 ? (
          <div className="flex items-center w-full space-x-2 text-sm font-semibold">
            <div className="w-[45%]">Name</div>
            <div className="w-[45%]">Value</div>
          </div>
        ) : null}

        {newInfo.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">
            No any info. Send this to remove the previous value)
          </div>
        ) : null}

        {newInfo.map((item, index) => (
          <div key={index} className="flex items-center w-full gap-2">
            <div className="w-[45%]">
              <Input
                value={item.key}
                error={!item.key}
                onChange={(e) => handleObjectKeyChange(index, e.target.value)}
                placeholder="Key"
              />
            </div>
            <div className="w-[45%]">
              <Input
                value={item.value}
                error={!item.value}
                onChange={(e) => handleObjectValueChange(index, e.target.value)}
                placeholder="Value"
              />
            </div>
            <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => removeObjectField(index)}>
              <X size={18} />
            </Button>
          </div>
        ))}
      </div>

      <Button size="sm" variant="link" onClick={addObjectField} className="flex items-center gap-1 p-0">
        <Plus size={16} /> Add Field
      </Button>

      <QRButton href={url} disabled={!areAllUniq || emptyFields.length > 0} className="w-full">
        Save changes
      </QRButton>
    </div>
  );
};

