import { FC } from "react";

import { AddWalletAddress } from "@/components/dialogs/AddWalletAddress";

import { useAaStore } from "@/store/aa-store";
import { userBalanceSelector } from "@/store/selectors/userBalanceSelector";
import { useSettingsStore } from "@/store/settings-store";

import { toLocalString } from "@/lib";

import { getExplorerUrl } from "@/lib/getExplorerUrl";

interface IGovernanceProfileProps {}

export const GovernanceProfile: FC<IGovernanceProfileProps> = () => {
  const { symbol, decimals, walletAddress } = useSettingsStore((state) => state);
  const userBalance = useAaStore((state) => userBalanceSelector(state, walletAddress));
  const formattedBalance = `${toLocalString(userBalance / 10 ** decimals!)} ${symbol}`;

  return (
    <div className="py-2">
      {walletAddress ? (
        <ul>
          <li>
            Your voting address is{" "}
            <a target="_blank" className="text-link" href={getExplorerUrl(walletAddress, "address")} rel="noopener noreferrer">
              {walletAddress}
            </a>
          </li>
          <li>Locked balance: {formattedBalance}</li>
        </ul>
      ) : (
        <div className="font-medium">
          Please{" "}
          <AddWalletAddress>
            <button className="underline">add your wallet address</button>
          </AddWalletAddress>
          , to see balance
        </div>
      )}
    </div>
  );
};

