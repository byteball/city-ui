import { Dialog } from "@radix-ui/react-dialog";
import cn from "classnames";
import { Info } from "lucide-react";
import moment from "moment";
import { FC } from "react";
import { Link } from "react-router";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";

import { NonNegativeNumber, paramName } from "@/global";
import { beautifyParamName, beautifyParamValue, formatPeriod, generateLink, toLocalString } from "@/lib";

import { paramDescriptions } from "@/pages/GovernancePage/descriptions";
import { defaultAaParams, useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";

import { SuggestAnotherValueDialog } from "../dialogs/suggestAnotherValueDialog";
import { QRButton } from "./_qr-button";
import { Button } from "./button";
import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

interface IGovernanceParamItemProps {
  name: paramName;
  currentValue: number | string;
  leader?: string | NonNegativeNumber;
  votes: {
    [paramValue: string | number]: {
      balance: number;
      address: string;
    }[];
  };
}

export const GovernanceParamItem: FC<IGovernanceParamItemProps> = ({ name, leader, currentValue, votes = {} }) => {
  const { decimals, symbol, challengingPeriod, walletAddress } = useSettingsStore((state) => state);
  const governanceAA = useAaStore((state) => state.state.constants?.governance_aa);

  const cityLabel = name === "mayor" ? "|city" : "";

  const { [`challenging_period_start_ts_${name}${cityLabel}`]: challengingPeriodStartAt } = useAaStore(
    (state) => state.governanceState
  );

  const { [`choice_${walletAddress}_${name}${cityLabel}`]: userChoice = null } = useAaStore(
    (state) => state.governanceState
  );

  const tokenInfo = { symbol: symbol!, decimals: decimals! };
  const commitUrl = generateLink({
    amount: 1e4,
    data: { name, commit: 1, city: 'city' },
    asset: "base",
    aa: governanceAA!,
    is_single: true,
    from_address: walletAddress || undefined,
  });

  const challengingPeriodEndTs = +(challengingPeriodStartAt ?? 0) + challengingPeriod!;

  const commitAllowed = !challengingPeriodStartAt || moment.utc().isAfter(moment.unix(challengingPeriodEndTs));

  const timeUntilCommit = !commitAllowed ? formatPeriod(challengingPeriodEndTs) : null;

  const commitDisabled = currentValue === leader || !commitAllowed;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col space-y-4 md:space-y-0 md:items-center md:justify-between md:flex-row">
          <div className="flex items-center space-x-2 ">
            <div>{beautifyParamName(name)}</div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div>
                    <Info className="w-5 text-gray-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px]">{paramDescriptions[name]}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {currentValue || defaultAaParams[name] ? (
            <div>
              <span className="inline-block mb-2 md:mb-0 md:inline">Current value:</span>{" "}
              <span className={cn({ "text-base/4 md:text-lg": name === "attestors" || name === "randomness_aa" })}>
                {beautifyParamValue(name, currentValue, tokenInfo)}
              </span>
            </div>
          ) : null}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 px-6 pb-0 md:p-6 md:pt-0">
        {leader ? (
          <div className="flex flex-col space-y-2 md:space-y-0 md:space-x-4 md:items-center md:justify-between md:flex-row">
            <div>Leader: {beautifyParamValue(name, leader, tokenInfo)}</div>
            <div>
              {commitAllowed ? <QRButton href={commitUrl} disabled={commitDisabled} variant="link" className="p-0 text-link">
                commit
              </QRButton> : <small className="text-yellow-600">Challenging period expires in {timeUntilCommit}</small>}
            </div>
          </div>
        ) : null}

        {userChoice && typeof userChoice !== "object" ? <div>
          My choice:{" "}<span>
            {beautifyParamValue(name, userChoice, tokenInfo)}
          </span>
        </div> : null}

        {Object.entries(votes).length ? (
          <Table>
            <TableHeader className="hidden md:table-header-group">
              <TableRow>
                <TableHead>Value</TableHead>
                <TableHead>Support</TableHead>
                <TableHead>Vote for this value</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow className="mt-4 text-lg md:hidden">
                <TableCell colSpan={999} className="w-full p-0">
                  <span className="block mt-2">
                    <b>Values</b>
                  </span>
                </TableCell>
              </TableRow>

              {Object.entries(votes).map(([value, votesForValue]) => (
                <TableRow key={value} className="flex flex-col py-4 md:table-row md:py-0">
                  <TableCell className="p-0 md:p-2">
                    <span className="md:hidden">Value: </span>
                    {beautifyParamValue(name, value, { decimals: decimals!, symbol: symbol! })}
                  </TableCell>
                  <TableCell className="p-0 md:p-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" className="p-0 text-link">
                          <span className="md:hidden">Support: </span>{" "}
                          {toLocalString(
                            votesForValue.reduce((acc, { balance }) => acc + Number(balance ?? 0), 0) / 10 ** decimals!
                          )}{" "}
                          {symbol}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Supporters</DialogTitle>
                        </DialogHeader>

                        <Table>
                          <TableHeader className="hidden md:table-header-group">
                            <TableRow>
                              <TableHead>Address</TableHead>
                              <TableHead>Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {votesForValue.map(({ address, balance }) => (
                              <TableRow key={address}>
                                <TableCell>
                                  <Link
                                    to={`/user/${address}`}
                                    className="text-link"
                                  >
                                    {String(address).slice(0, 5)}...{String(address).slice(-5, String(address).length)}
                                  </Link>
                                  <div className="mt-2 md:hidden">
                                    {toLocalString(balance / 10 ** decimals!)} {symbol}
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {toLocalString(balance / 10 ** decimals!)} {symbol}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </DialogContent>
                    </Dialog>
                  </TableCell>

                  <TableCell className="p-0 md:p-2">
                    <SuggestAnotherValueDialog name={name} value={value}>
                      <Button variant="link" className="p-0 text-link">
                        vote for this value
                      </Button>
                    </SuggestAnotherValueDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </CardContent>
      <CardFooter>
        <SuggestAnotherValueDialog name={name}>
          <Button variant="link" className="p-0 text-link">
            suggest another value
          </Button>
        </SuggestAnotherValueDialog>
      </CardFooter>
    </Card>
  );
};

