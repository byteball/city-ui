import { CircleXIcon, LinkIcon } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router";

import { generateLink } from "@/lib";
import { useSettingsStore } from "@/store/settings-store";

import appConfig from "@/appConfig";

const ClaimRedirectPage = () => {
  const walletAddress = useSettingsStore((state) => state.walletAddress);

  const { nums } = useParams<{ nums: string }>();

  const [plot1_num, plot2_num] = nums?.split("-").map(Number) || [];

  const isValidPlotNumbers =
    nums && !isNaN(plot1_num) && !isNaN(plot2_num) && Number.isInteger(plot1_num) && Number.isInteger(plot2_num);

  if (!isValidPlotNumbers) {
    return (
      <div className="text-lg text-center min-h-[75vh] mt-10">
        <CircleXIcon className="w-10 h-10 mx-auto mb-5" />
        <h1 className="mb-5 text-4xl font-extrabold tracking-tight scroll-m-20 lg:text-5xl">Error</h1>

        <div className="text-lg text-center">Invalid plot numbers</div>
      </div>
    );
  }

  const url = generateLink({
    amount: 1e4,
    aa: appConfig.AA_ADDRESS!,
    is_single: true,
    data: { build: 1, plot1_num, plot2_num },
    from_address: walletAddress || undefined,
  });

  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      window.location.href = url;
    }, 3000);

    // Clean up timer on unmount
    return () => clearTimeout(redirectTimer);
  }, [url]);

  return (
    <div className="text-lg text-center min-h-[75vh] mt-10">
      <LinkIcon className="w-10 h-10 mx-auto mb-5 animate-pulse" />
      <h1 className="mb-5 text-4xl font-extrabold tracking-tight scroll-m-20 lg:text-5xl">Redirect</h1>

      <div className="text-lg text-center">
        You will be automatically redirected to the wallet in 3 seconds. If the redirection does not occur, please click{" "}
        <a href={url} className="text-link">
          this link
        </a>
        .
      </div>
    </div>
  );
};

export default ClaimRedirectPage;
