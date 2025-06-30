import { FC, KeyboardEvent, ReactNode, useCallback, useMemo, useRef, useState } from "react";

import { paramName } from "@/global";
import {
  beautifyParamName,
  generateLink,
  getCountOfDecimals,
  numericInputParamNames,
  percentInputParamNames,
  validateParam,
} from "@/lib";
import { paramDescriptions } from "@/pages/GovernancePage/descriptions";
import { useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";
import { QRButton } from "../ui/_qr-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface ISuggestAnotherValueDialogProps {
  children: ReactNode;
  name: paramName;
  value?: number | string;
}

const getInitialInputValue = (defaultValue: number | string | undefined, name: paramName, decimals: number): string => {
  if (defaultValue === undefined || defaultValue === null) return "";
  if (percentInputParamNames.includes(name)) {
    return (+(Number(defaultValue) * 100).toFixed(4)).toString();
  } else if (name === "plot_price") {
    return (+(Number(defaultValue) / 10 ** decimals).toFixed(decimals)).toString();
  } else {
    return String(defaultValue);
  }
};

export const SuggestAnotherValueDialog: FC<ISuggestAnotherValueDialogProps> = ({
  children,
  name,
  value: defaultValue,
}) => {
  const { decimals, symbol, walletAddress } = useSettingsStore((state) => state);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [inputValue, setInputValue] = useState<string>(() => getInitialInputValue(defaultValue, name, decimals!));
  const governanceAA = useAaStore((state) => state.state.constants?.governance_aa);

  let maxInputDecimals = decimals!;
  let suffix = "";
  let maxAllowedValue = 100; // only for numeric params

  if (name === "referral_boost") {
    maxAllowedValue = Infinity; // no limit for referral boost
    suffix = "%";
    maxInputDecimals = 4;
  } else if (percentInputParamNames.includes(name)) {
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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitButtonRef.current?.click();
      }
    },
    [submitButtonRef]
  );

  const transformValue = useCallback(
    (val: string) => {
      if (percentInputParamNames.includes(name)) {
        return Number(val) / 100;
      } else if (name === "plot_price") {
        return Number(val) * 10 ** decimals!;
      }
      return val;
    },
    [name, decimals]
  );

  const [isValid, error] = useMemo(() => validateParam(name, inputValue), [name, inputValue]);

  const url = generateLink({
    amount: 1e4,
    data: { name, value: transformValue(inputValue), city: name === "mayor" ? "city" : undefined },
    aa: governanceAA!,
    from_address: walletAddress || undefined,
    is_single: true,
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
            {name === "attestors" ? (
              <small>If you want to use multiple addresses, use ":" as a separator.</small>
            ) : null}
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

