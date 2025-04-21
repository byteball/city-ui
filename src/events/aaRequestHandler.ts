import appConfig from "@/appConfig";
import { toast } from "@/hooks/use-toast";
import { useSettingsStore } from "@/store/settings-store";

const showLogs = !!appConfig.TESTNET;

export const aaRequestHandler = (err: string | null, result: any) => {
  if (err && showLogs) console.error("log: aaRequestHandler error", err, result);
  if (err) return null;

  if (showLogs) console.log("log: aaRequestHandler", err, result);

  const { body } = result[1];
  const { aa_address, unit } = body;

  const { walletAddress } = useSettingsStore.getState();
  if (!walletAddress) return;

  if (unit && unit.authors && unit.authors.find(({ address }: { address: string }) => address === walletAddress)) {
    if (showLogs) console.log(`log: user request: ${walletAddress}`, unit);

    toast({
      title: "New request",
      description: `Your request has been received and is awaiting confirmation.`,
    });
  }
};

