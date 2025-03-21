import { FC, useRef, ReactNode, KeyboardEvent, useCallback, useState, useMemo } from "react";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { paramName } from "@/global";
import { paramDescriptions } from "@/pages/GovernancePage/descriptions";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { beautifyParamName } from "@/lib/beautifyParamName";
import { QRButton } from "../ui/_qr-button";
import { useSettingsStore } from "@/store/settings-store";
import { getCountOfDecimals } from "@/lib/getCountOfDecimals";
import { numericInputParamNames, percentInputParamNames, validateParam } from "@/lib/validateParam";
import { generateLink } from "@/lib";
import { useAaStore } from "@/store/aa-store";

interface ISuggestAnotherValueDialogProps {
  children: ReactNode;
  name: paramName;
  value?: number | string;
}

const getInitialInputValue = (
  defaultValue: number | string | undefined,
  name: paramName,
  decimals: number
): string => {
  if (defaultValue === undefined || defaultValue === null) return "";
  if (percentInputParamNames.includes(name)) {
    return (Number(defaultValue) * 100).toFixed(4);
  } else if (name === "plot_price") {
    return (Number(defaultValue) / 10 ** decimals).toFixed(decimals);
  } else {
    return String(defaultValue);
  }
};

export const SuggestAnotherValueDialog: FC<ISuggestAnotherValueDialogProps> = ({ children, name, value: defaultValue }) => {
  const { decimals, symbol } = useSettingsStore((state) => state);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [inputValue, setInputValue] = useState<string>(() => getInitialInputValue(defaultValue, name, decimals!));
  const governanceAA = useAaStore((state) => state.state.constants?.governance_aa);

  let maxInputDecimals = decimals!;
  let suffix = "";
  let maxAllowedValue = 100; // only for numeric params

  if (percentInputParamNames.includes(name)) {
    suffix = "%";
    maxInputDecimals = 4;
    maxAllowedValue = 100;
  } else if (name === "plot_price") {
    suffix = symbol!;
    maxAllowedValue = 1000 * 10 ** decimals!;
  }

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value.trim() ?? "";
      setInputValue((prevValue) => {
        if (percentInputParamNames.includes(name) || numericInputParamNames.includes(name)) {
          if (getCountOfDecimals(newValue) <= maxInputDecimals && Number(newValue) <= maxAllowedValue) {
            return newValue === "." || newValue === "," ? "0." : !isNaN(Number(newValue)) ? newValue : prevValue;
          }
          return prevValue;
        } else {
          return newValue.toUpperCase();
        }
      });
    },
    [maxInputDecimals, maxAllowedValue, name]
  );

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitButtonRef.current?.click();
    }
  }, [submitButtonRef]);

  const transformValue = useCallback((val: string) => {
    if (percentInputParamNames.includes(name)) {
      return Number(val) / 100;
    } else if (name === "plot_price") {
      return Number(val) * 10 ** decimals!;
    }
    return val;
  }, [name, decimals]);

  const [isValid, error] = useMemo(() => validateParam(name, inputValue), [name, inputValue]);

  const url = generateLink({
    amount: 1e4,
    data: { name, value: transformValue(inputValue) },
    aa: governanceAA!
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent autoFocus={false}>
        <DialogHeader>
          <DialogTitle>
            Change <span className="lowercase">{beautifyParamName(name)}</span>
          </DialogTitle>
          <DialogDescription>{paramDescriptions[name]}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor={`value${name}`}>Parameter value</Label>
            <Input
              error={inputValue !== "" ? error : undefined}
              value={inputValue}
              suffix={suffix}
              id={`value${name}`}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={defaultValue !== undefined}
            />
          </div>
        </div>
        <DialogFooter>
          <QRButton
            autoFocus={false}
            ref={submitButtonRef}
            disabled={!isValid || !inputValue}
            className="w-full"
            href={url}
          >
            Suggest New Value
          </QRButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
