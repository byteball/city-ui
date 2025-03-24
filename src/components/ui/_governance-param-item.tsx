import { FC } from "react";
import moment from 'moment';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";

import { NonNegativeNumber, paramName } from "@/global";
import { beautifyParamName } from "@/lib/beautifyParamName";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { Info } from "lucide-react";
import { paramDescriptions } from "@/pages/GovernancePage/descriptions";
import { defaultAaParams, useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";
import { beautifyParamValue } from "@/lib/beautifyParamValue";
import { QRButton } from "./_qr-button";
import { generateLink, toLocalString } from "@/lib";
import { Button } from "./button";
import appConfig from "@/appConfig";
import { SuggestAnotherValueDialog } from "../dialogs/suggestAnotherValueDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";


interface IGovernanceParamItemProps {
	name: paramName;
	currentValue: number | string;
	leader?: string | NonNegativeNumber;
	votes: {
		[paramValue: string | number]: {
			balance: number;
			address: string;
		}[];
	}
}

export const GovernanceParamItem: FC<IGovernanceParamItemProps> = ({ name, leader, currentValue, votes = {} }) => {
	const { decimals, symbol, challengingPeriod } = useSettingsStore((state) => state);
	const governanceAA = useAaStore((state) => state.state.constants?.governance_aa);
	const { [`challenging_period_start_ts_${name}`]: challengingPeriodStartAt } = useAaStore((state) => state.governanceState);

	const tokenInfo = { symbol: symbol!, decimals: decimals! };
	const commitUrl = generateLink({ amount: 1e4, data: { name, commit: 1 }, asset: "base", aa: governanceAA! });

	const challengingPeriodEndTs = (+(challengingPeriodStartAt ?? 0)) + challengingPeriod!;

	const commitAllowed = !challengingPeriodStartAt || moment.utc().isAfter(moment.unix(challengingPeriodEndTs));

	const timeUntilCommit = commitAllowed
		? "Now"
		: moment.duration(moment.unix(challengingPeriodEndTs)
			.diff(moment.utc()))
			.humanize();

	const commitDisabled = currentValue === leader || !commitAllowed;

	return <Card>
		<CardHeader>
			<CardTitle className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<div>{beautifyParamName(name)}</div>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								<div><Info className="w-5 text-gray-500" /></div>
							</TooltipTrigger>
							<TooltipContent className="max-w-[250px]">
								{paramDescriptions[name]}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
				{(currentValue || defaultAaParams[name]) ? <div>Current value: {beautifyParamValue(name, currentValue, tokenInfo)}</div> : null}
			</CardTitle>
		</CardHeader>
		<CardContent>
			{leader ? <div className="flex items-center justify-between space-x-4">
				<div>Leader: {beautifyParamValue(name, leader, tokenInfo)}</div>
				<div>
					<QRButton href={commitUrl} disabled={commitDisabled} variant="link" className="p-0 text-link">commit</QRButton>
					{!commitAllowed ? <small className="text-yellow-600">Time to unlock: {timeUntilCommit}</small> : null}
				</div>
			</div> : null}
			{Object.entries(votes).length ? <Table>
				<TableHeader>
					<TableRow>
						<TableHead>Value</TableHead>
						<TableHead>Support</TableHead>
						<TableHead>Vote for this value</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{Object.entries(votes).map(([value, votesForValue]) => (<TableRow key={value}>
						<TableCell>{beautifyParamValue(name, value, { decimals: decimals!, symbol: symbol! })}</TableCell>
						<TableCell>
							<Dialog>
								<DialogTrigger asChild>
									<Button variant="link" className="p-0 text-link">{toLocalString(votesForValue.reduce((acc, { balance }) => acc + Number(balance ?? 0), 0) / 10 ** decimals!)} {symbol}</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Supporters</DialogTitle>
									</DialogHeader>

									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Address</TableHead>
												<TableHead>Amount</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{votesForValue.map(({ address, balance }) => <TableRow key={address}>
												<TableCell>{address}</TableCell>
												<TableCell>{toLocalString(balance / 10 ** decimals!)} {symbol}</TableCell>
											</TableRow>)}
										</TableBody>
									</Table>

								</DialogContent>
							</Dialog>
						</TableCell>

						<TableCell>
							<SuggestAnotherValueDialog name={name} value={value}>
								<Button variant="link" className="p-0 text-link">vote for this value</Button>
							</SuggestAnotherValueDialog>
						</TableCell>
					</TableRow>
					))}
				</TableBody>
			</Table> : null}
		</CardContent>
		<CardFooter>
			<SuggestAnotherValueDialog name={name}>
				<Button variant="link" className="p-0 text-link">suggest another value</Button>
			</SuggestAnotherValueDialog>
		</CardFooter>
	</Card>
};