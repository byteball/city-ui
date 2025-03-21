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

export const SuggestAnotherValueDialog: FC<ISuggestAnotherValueDialogProps> = ({ children, name, value: defaultValue }) => {
	const { decimals, symbol } = useSettingsStore((state) => state);
	const btnRef = useRef<HTMLButtonElement>(null);
	const [value, setValue] = useState<string>(defaultValue ? String(percentInputParamNames.includes(name) ? +(Number(defaultValue) * 100).toFixed(4) : (name === "plot_price" ? +(Number(defaultValue) / 10 ** decimals!).toFixed(decimals!) : defaultValue)) : "");
	const governanceAA = useAaStore((state) => state.state.constants?.governance_aa);

	let maxInputDecimals = decimals!;
	let suffix = "";
	let maxValue = 100; // only for numeric params

	if (percentInputParamNames.includes(name)) {
		suffix = "%";
		maxInputDecimals = 4;
		maxValue = 100;
	} else if (name === "plot_price") {
		suffix = symbol!;
		maxValue = 1000 * 10 ** decimals!;
	}

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value.trim() ?? "";

			setValue(value => {
				if (percentInputParamNames.includes(name) || numericInputParamNames.includes(name)) {
					if ((getCountOfDecimals(newValue) <= maxInputDecimals && Number(newValue) <= maxValue)) {
						return newValue === "." || newValue === "," ? "0." : !isNaN(Number(newValue)) ? newValue : value;
					}

					return value;
				} else {
					return newValue.toUpperCase();
				}
			});

		},
		[setValue, decimals]
	);


	const handleKeyDown = useCallback(
		(e: KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter") {
				e.preventDefault();
				btnRef.current?.click();
			}
		},
		[btnRef]
	);

	const transformValue = useCallback((value: string) => {
		if (percentInputParamNames.includes(name)) {
			return Number(value) / 100
		} else if (name === "plot_price") {
			return Number(value) * 10 ** decimals!;
		}

		return value;
	}, [name, value]);

	const [valid, error] = useMemo(() => validateParam(name, value), [name, value]);

	const url = generateLink({ amount: 1e4, data: { name, value: transformValue(value) }, aa: governanceAA! });

	return <Dialog>
		<DialogTrigger asChild>{children}</DialogTrigger>
		<DialogContent autoFocus={false}>
			<DialogHeader>
				<DialogTitle>Change <span className="lowercase">{beautifyParamName(name)}</span></DialogTitle>
				<DialogDescription>
					{paramDescriptions[name]}
				</DialogDescription>
			</DialogHeader>
			<div className="grid gap-4 py-4">
				<div className="flex flex-col space-y-2">
					<Label htmlFor={"value" + name}>Parameter value</Label>
					<Input
						error={value !== "" ? error : undefined}
						value={value}
						suffix={suffix}
						id={"value" + name}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						disabled={defaultValue !== undefined}
					/>
				</div>
			</div>
			<DialogFooter>
				<QRButton autoFocus={false} ref={btnRef} disabled={!valid || !value} className="w-full" href={url}>
					Add support for this
				</QRButton>
			</DialogFooter>
		</DialogContent>
	</Dialog>
}
