import { FC } from "react"

import { AddWalletAddress } from "@/components/dialogs/AddWalletAddress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useSettingsStore } from "@/store/settings-store";
import { useAaStore } from "@/store/aa-store";
import { userBalanceSelector } from "@/store/selectors/userBalanceSelector";

import { toLocalString } from "@/lib";
import appConfig from "@/appConfig";

interface IGovernanceProfileProps { };

export const GovernanceProfile: FC<IGovernanceProfileProps> = () => {
    const { symbol, decimals, walletAddress } = useSettingsStore((state) => state);
    const userBalance = useAaStore(state => userBalanceSelector(state, walletAddress));
    const balanceView = `${toLocalString(userBalance / 10 ** decimals!)} ${symbol}`;

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent>
                {walletAddress ? <ul>
                    <li>Your voting address is <a target="_blank" className="text-link" href={`https://${appConfig.TESTNET ? 'testnet' : ''}explorer.obyte.org/address/${walletAddress}`} rel="noopener">{walletAddress}</a></li>
                    <li>Locked balance: {balanceView}</li>
                </ul> : <div className="font-medium">Please <AddWalletAddress><button className="underline">add your wallet address</button></AddWalletAddress></div>}
            </CardContent>
        </Card>
    )
}