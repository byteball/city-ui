import cn from "classnames";
import { differenceBy, isArray, isObject, unionBy } from "lodash";
import { InfoIcon, Plus, X } from "lucide-react";
import { FC, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";

import { QRButton } from "@/components/ui/_qr-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { useSettingsStore } from "@/store/settings-store";

import { IMapUnit, IMapUnitInfo } from "@/global";
import { generateLink, getInformationPrefix } from "@/lib";
import { defaultInformationFields } from "@/locales";

import appConfig from "@/appConfig";

interface EditInfoFormProps {
  address?: string;
  unitData:
    | IMapUnit
    | {
        type: "user";
        info: IMapUnitInfo | string;
      };
}

const PAYLOAD_STRING_LIMIT = 10000 as const;

interface IField {
  key: string;
  value: string;
  isDefault?: boolean;
  isModified: boolean;
  isValid: boolean;
}

const getDefaultFields = (currentInfo: IMapUnit["info"]): IField[] => {
  const defaultFields = Object.keys(defaultInformationFields).map(
    (field: string): IField => ({
      key: field,
      value: getInformationPrefix(field),
      isDefault: true,
      isModified: false,
      isValid: true,
    })
  );

  if (!currentInfo) return defaultFields;

  if (typeof currentInfo === "string") {
    const fields = defaultFields.filter((v) => v.key !== "name");
    return [{ key: "name", value: currentInfo, isDefault: true, isModified: true, isValid: true }, ...fields];
  }

  if (isObject(currentInfo)) {
    const currentInfoFields = Object.entries(currentInfo).map(([key, value]) => ({
      key,
      value: value?.toString().startsWith(getInformationPrefix(key))
        ? value.toString()
        : getInformationPrefix(key) + value,
      isDefault: key in defaultInformationFields,
      isModified: true,
      isValid: true,
    }));

    const unSetDefaultFields = differenceBy(defaultFields, currentInfoFields, "key");

    return [...currentInfoFields, ...unSetDefaultFields];
  }

  return [];
};

export const EditInfoForm: FC<EditInfoFormProps> = ({ unitData }) => {
  const { info: currentInfo, type } = unitData;
  const walletAddress = useSettingsStore((state) => state.walletAddress!);
  const [newInfo, setNewInfo] = useState<Array<Record<string, any>>>(getDefaultFields(currentInfo));
  const [contentHeight, setContentHeight] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

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

  const handleObjectValueChange = (index: number, input: string) => {
    setNewInfo((prev) => {
      const updatedFields = [...prev];
      const fieldKey = updatedFields[index].key;
      const prefix = getInformationPrefix(fieldKey);
      const inputWithoutSpaces = input.replaceAll(" ", "");

      if (!input.trim()) {
        // If input is empty, just use the prefix
        updatedFields[index].value = prefix;
      } else if (prefix) {
        // Handle URL prefixes (http://, https://) specially to avoid duplication
        const isUrlPrefix = prefix.match(/^(https:\/\/)/);

        if (isUrlPrefix && inputWithoutSpaces.startsWith("https://")) {
          // If input already has a URL protocol, use it as is
          updatedFields[index].value = inputWithoutSpaces;
        } else if (!input.startsWith(prefix)) {
          // If input doesn't start with prefix, add the prefix
          updatedFields[index].value = prefix;
        } else {
          // Otherwise use input as is (maintaining prefix if present)
          updatedFields[index].value = inputWithoutSpaces;
        }
      } else {
        // No prefix, just use the input
        updatedFields[index].value = input;
      }

      let isValid = true;

      if (fieldKey in defaultInformationFields) {
        isValid = defaultInformationFields[fieldKey].validationFunc(updatedFields[index].value);
      }

      updatedFields[index].isValid = isValid;

      return updatedFields;
    });
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
  const obj = newInfo.reduce((acc, { key, value }) => {
    // Skip empty default fields and fields with no key or with prefix
    if ((key in defaultInformationFields && (value === "" || value === getInformationPrefix(key))) || !key) {
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
  const emptyFields = newInfo.filter((item) => !item.key || (!item.value && !(item.key in defaultInformationFields)));

  const url = generateLink({
    amount: 10000,
    data: {
      ...(type === "house"
        ? { house_num: unitData.house_num, edit_house: 1 }
        : type === "user"
        ? { edit_user: 1 }
        : { plot_num: unitData.plot_num, edit_plot: 1 }),
      info: obj,
    },
    from_address: walletAddress,
    aa: appConfig.AA_ADDRESS,
    asset: "base",
    is_single: true,
  });

  const areAllValid = newInfo.every(
    (item) =>
      item.isValid ||
      !(item.key in defaultInformationFields) ||
      (item.key in defaultInformationFields && item.value === getInformationPrefix(item.key))
  );

  const disabled = !areAllUniq || emptyFields.length > 0 || isVeryLarge || !areAllValid;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!disabled && e.key === "Enter") {
        btnRef.current?.click();
      }
    },
    [btnRef.current, disabled]
  );

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-medium">Edit Information</h3>
        <p className="text-sm text-muted-foreground">
          Anything you want to say about this {unitData.type} and its owner (you).
        </p>
      </div>

      <ScrollArea style={{ height: contentHeight }} type="always">
        <div ref={contentRef} className="pl-1 space-y-2">
          {newInfo.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center flex-grow-0 flex-shrink-0 w-full pr-5 sm:gap-2 sm:pr-0 sm:flex-row"
            >
              <div className="w-full sm:w-[42%] flex-grow-0 flex-shrink-0">
                <Input
                  value={item.key}
                  disabled={item.isDefault}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => handleObjectKeyChange(index, e.target.value)}
                  placeholder="Field name"
                />
              </div>

              <div className="w-full sm:w-[42%] flex-grow-0 flex-shrink-0">
                <Input
                  value={item.value}
                  onKeyDown={handleKeyDown}
                  error={
                    item.key in defaultInformationFields && item.value !== getInformationPrefix(item.key)
                      ? !item.isValid
                      : false
                  }
                  onChange={(e) => handleObjectValueChange(index, e.target.value)}
                  placeholder={defaultInformationFields[item.key]?.placeholder ?? ""}
                />
              </div>

              {item.key in defaultInformationFields ? (
                "hint" in defaultInformationFields[item.key] ? (
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipContent className="max-w-xs">
                        <div>{defaultInformationFields[item.key]?.hint}</div>
                        <div className="mt-2 italic">{defaultInformationFields[item.key]?.validationRule}</div>
                      </TooltipContent>
                      <TooltipTrigger className="flex items-center justify-center">
                        <InfoIcon
                          size={18}
                          className={cn(
                            "ml-2",
                            item.isValid || item.value === getInformationPrefix(item.key)
                              ? "text-muted-foreground"
                              : "text-red-500"
                          )}
                        />
                      </TooltipTrigger>
                    </Tooltip>
                  </TooltipProvider>
                ) : null
              ) : (
                <Button size="icon" variant="secondary" className="h-9 w-9" onClick={() => removeObjectField(index)}>
                  <X size={18} />
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {isVeryLarge && (
        <div className="text-sm text-red-500">The information is too large. Please reduce the content.</div>
      )}

      {!areAllUniq && (
        <div className="text-sm text-red-500">Duplicate field names detected. All field names must be unique.</div>
      )}

      <Button size="sm" variant="link" onClick={addObjectField} className="flex items-center gap-1 p-0">
        <Plus size={16} /> Add a custom field
      </Button>

      <QRButton href={url} ref={btnRef} disabled={disabled} className="w-full">
        Save changes
      </QRButton>
    </div>
  );
};

