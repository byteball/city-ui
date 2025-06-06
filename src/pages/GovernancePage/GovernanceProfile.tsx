import { FC } from "react";

import { AddWalletAddress } from "@/components/dialogs/AddWalletAddress";

import { useAaStore } from "@/store/aa-store";
import { userBalanceSelector } from "@/store/selectors/userBalanceSelector";
import { useSettingsStore } from "@/store/settings-store";

import { getExplorerUrl, toLocalString } from "@/lib";

interface IGovernanceProfileProps { }

export const GovernanceProfile: FC<IGovernanceProfileProps> = () => {
  const { symbol, decimals, walletAddress } = useSettingsStore((state) => state);
  const userBalance = useAaStore((state) => userBalanceSelector(state, walletAddress));
  const formattedBalance = `${toLocalString(userBalance / 10 ** decimals!)} ${symbol}`;

  return (
    <div className="py-2">
      {walletAddress ? (
        <ul>
          <li>
            Your voting address: {" "}
            <a target="_blank" className="text-link" href={getExplorerUrl(walletAddress, "address")} rel="noopener">
              {String(walletAddress).slice(0, 5)}...{String(walletAddress).slice(-5, String(walletAddress).length)}
            </a>
          </li>
          <li>Your voting balance: {formattedBalance}</li>
        </ul>
      ) : (
        <div className="font-medium">
          Please{" "}
          <AddWalletAddress>
            <button className="underline">add your wallet address</button>
          </AddWalletAddress>
          to see voting balance
        </div>
      )}
    </div>
  );
};

