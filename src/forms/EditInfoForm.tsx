import { differenceBy, isArray, isObject, unionBy } from "lodash";
import { Plus, X } from "lucide-react";
import { FC, useEffect, useRef, useState } from "react";

import { QRButton } from "@/components/ui/_qr-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useSettingsStore } from "@/store/settings-store";

import { IMapUnit } from "@/global";
import { generateLink } from "@/lib";

import appConfig from "@/appConfig";

interface EditInfoFormProps {
  unitData: IMapUnit;
}

const socialNetworks = ["twitter", "telegram", "facebook", "instagram"];

const defaultFieldKeys = ["name", "homepage", ...socialNetworks] as const;

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
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  // Calculate content height whenever newInfo changes
  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight + 5;
      setContentHeight(Math.min(height, 390));
    }
  }, [newInfo]);

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
          You can edit the information here, which will be <b>publicly published</b> in the DAG and linked to this{" "}
          {unitData.type}.
        </p>
      </div>

      <ScrollArea style={{ height: contentHeight }} type="always">
        <div ref={contentRef} className="space-y-2">
          {newInfo.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center flex-grow-0 flex-shrink-0 w-full pr-5 sm:gap-2 sm:pr-0 sm:flex-row"
            >
              <div className="w-full sm:w-[42%] flex-grow-0 flex-shrink-0">
                <Input
                  value={item.key}
                  disabled={defaultFieldKeys.includes(item.key)}
                  error={!item.key}
                  onChange={(e) => handleObjectKeyChange(index, e.target.value)}
                  placeholder="Field name"
                />
              </div>

              <div className="w-full sm:w-[42%] flex-grow-0 flex-shrink-0">
                <Input
                  value={item.value}
                  error={defaultFieldKeys.includes(item.key) ? false : !item.value}
                  onChange={(e) => handleObjectValueChange(index, e.target.value)}
                  placeholder="Value"
                />
              </div>

              {!defaultFieldKeys.includes(item.key) ? (
                <Button size="icon" variant="secondary" className="h-9 w-9" onClick={() => removeObjectField(index)}>
                  <X size={18} />
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </ScrollArea>

      <Button size="sm" variant="link" onClick={addObjectField} className="flex items-center gap-1 p-0">
        <Plus size={16} /> Add custom field
      </Button>

      <QRButton href={url} disabled={!areAllUniq || emptyFields.length > 0 || isVeryLarge} className="w-full">
        Save changes
      </QRButton>
    </div>
  );
};

