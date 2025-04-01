import { differenceBy, isArray, isObject, unionBy } from "lodash";
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

const defaultFieldKeys = ["name", "homepage", "twitter", "telegram", "facebook", "instagram"] as const;

const PAYLOAD_STRING_LIMIT = 10000 as const;

const getDefaultFields = (currentInfo: IMapUnit["info"]): Array<Record<string, any>> => {
  const defaultFields = defaultFieldKeys.map((field: string) => ({ key: field, value: "" }));
  if (!currentInfo) return defaultFields;

  if (typeof currentInfo === "string") {
    const fields = defaultFields.filter((v) => v.key !== "name").map((field) => ({ key: field.key, value: "" }));
    return [{ key: "name", value: currentInfo }, ...fields];
  }

  if (isObject(currentInfo)) {
    const currentInfoFields = Object.entries(currentInfo).map(([key, value]) => ({
      key,
      value,
    }));

    const unSetDefaultFields = differenceBy(defaultFields, currentInfoFields, "key");

    return [...currentInfoFields, ...unSetDefaultFields];
  }

  return [];
};

export const EditInfoForm: FC<EditInfoFormProps> = ({ unitData }) => {
  const { info: currentInfo, type, plot_num } = unitData;
  const walletAddress = useSettingsStore((state) => state.walletAddress!);
  const [newInfo, setNewInfo] = useState<Array<Record<string, any>>>(getDefaultFields(currentInfo));

  const handleObjectKeyChange = (index: number, value: string) => {
    if (isArray(newInfo)) {
      const updatedInfo = [...newInfo];
      updatedInfo[index].key = value.trim();
      setNewInfo(updatedInfo);
    }
  };

  const handleObjectValueChange = (index: number, value: string) => {
    if (isArray(newInfo)) {
      const updatedInfo = [...newInfo];
      updatedInfo[index].value = value.trim();
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
    // Skip empty default fields and fields with no key
    if ((defaultFieldKeys.includes(key as (typeof defaultFieldKeys)[number]) && value === "") || !key) {
      return acc; // Skip this field
    }

    // Sanitize the value - trim any whitespace
    acc[key] = typeof value === "string" ? value.trim() : value;
    return acc;
  }, {} as Record<string, any>);

  // Convert to JSON string with error handling
  let objString = "";
  try {
    objString = JSON.stringify(obj);
    if (objString.length > PAYLOAD_STRING_LIMIT) {
      // Arbitrary limit to prevent URL issues
      console.warn("Warning: Info object is very large and may cause URL issues");
    }
  } catch (error) {
    console.error("Error serializing info object:", error);
    // Could show an error to the user here
  }

  const isVeryLarge = objString.length > PAYLOAD_STRING_LIMIT;

  // Check for duplicate keys
  const areAllUniq = unionBy(newInfo, "key").length === newInfo.length;

  // Check for empty fields that require values
  const emptyFields = newInfo.filter(
    (item) => !item.key || (!item.value && !defaultFieldKeys.includes(item.key as (typeof defaultFieldKeys)[number]))
  );

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

  return (
    <div className="mt-8 space-y-4 ">
      <div className="mb-6">
        <h3 className="text-lg font-medium">Edit Information</h3>
        <p className="text-sm text-muted-foreground">
          You can edit the information here, which will be <b>publicly published</b> and linked to this {unitData.type}.
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
                disabled={defaultFieldKeys.includes(item.key)}
                error={!item.key}
                onChange={(e) => handleObjectKeyChange(index, e.target.value)}
                placeholder="Field name"
              />
            </div>
            <div className="w-[45%]">
              <Input
                value={item.value}
                error={defaultFieldKeys.includes(item.key) ? false : !item.value}
                onChange={(e) => handleObjectValueChange(index, e.target.value)}
                placeholder="Value"
              />
            </div>
            {!defaultFieldKeys.includes(item.key) ? (
              <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => removeObjectField(index)}>
                <X size={18} />
              </Button>
            ) : null}
          </div>
        ))}
      </div>

      <Button size="sm" variant="link" onClick={addObjectField} className="flex items-center gap-1 p-0">
        <Plus size={16} /> Add custom field
      </Button>

      <QRButton href={url} disabled={!areAllUniq || emptyFields.length > 0 || isVeryLarge} className="w-full">
        Save changes
      </QRButton>
    </div>
  );
};

