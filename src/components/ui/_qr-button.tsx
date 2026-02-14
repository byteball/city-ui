import { QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { forwardRef, useCallback, useState } from "react";

import { walletActionType } from "@/global";
import { openCustomProtocol } from "@/lib/openCustomProtocol";
import cn from "classnames";
import { WalletProtocolPopover } from "./_wallet-protocol-popover";
import { Button, ButtonProps } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

interface IQRButtonProps extends ButtonProps {
  href: string;
  actionType?: walletActionType;
}

export const QRButton = forwardRef<HTMLButtonElement, IQRButtonProps>(
  ({ children, href, variant, actionType = "transaction", disabled = false, ...props }, ref) => {
    const [showPopover, setShowPopover] = useState(false);

    const qrTooltip = actionType === "chat" ? "Start a chat with the bot on your mobile phone" : "Send the transaction from your mobile phone";


    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        openCustomProtocol({
          href,
          onProtocolMissing: () => {
            setShowPopover(true);
          },
        });
      },
      [href]
    );

    return (
      <div className="flex">
        <Dialog>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button
                    {...props}
                    variant={variant}
                    tabIndex={-1}
                    disabled={disabled}
                    className={cn("px-3 rounded-tr-none rounded-br-none", variant === "link" ? "px-1" : "px-3")}
                  >
                    <QrCode className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px]">
                <p>{qrTooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DialogContent className="sm:max-w-[360px]">
            <DialogHeader className="w-full mb-4 text-center">
              <DialogTitle className="mx-auto leading-snug text-center max-w-[200px]">
                Scan this QR code <br /> with your mobile phone
              </DialogTitle>
            </DialogHeader>
            <div className="mx-auto">
              <a href={href}>
                <QRCodeSVG size={200} className="qr" bgColor="#24292e" fgColor="#fff" value={href} />
              </a>
            </div>

            <div className="text-xs text-foreground max-w-[220px] mx-auto text-center">
              Install Obyte wallet for{" "}
              <a
                className="text-link"
                rel="noopener"
                target="_blank"
                href="https://itunes.apple.com/us/app/byteball/id1147137332?ls=1&mt=8"
              >
                iOS
              </a>{" "}
              or{" "}
              <a
                className="text-link"
                rel="noopener"
                target="_blank"
                href="https://play.google.com/store/apps/details?id=org.byteball.wallet"
              >
                Android
              </a>{" "}
              if you don't have one yet
            </div>
          </DialogContent>
        </Dialog>
        <WalletProtocolPopover
          open={showPopover}
          actionType={actionType}
          onOpenChange={setShowPopover}
          triggerType={variant === "link" ? "link" : "button"}
        >
          <Button
            {...props}
            variant={variant}
            disabled
            asChild
            ref={ref}
            className={cn("pl-2 rounded-tl-none rounded-bl-none cursor-pointer", {
              "pointer-events-none opacity-50 select-none": disabled,
            })}
          >
            <a href={href} tabIndex={-1} onClick={handleClick}>
              {children}
            </a>
          </Button>
        </WalletProtocolPopover>
      </div>
    );
  }
);
