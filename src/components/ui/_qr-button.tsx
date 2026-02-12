import { QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { forwardRef, useCallback, useState } from "react";
import customProtocolCheck from "custom-protocol-check";

import cn from "classnames";
import { Button, ButtonProps } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { Popover, PopoverArrow, PopoverContent, PopoverTrigger } from "./popover";

interface IQRButtonProps extends ButtonProps {
  href: string;
}

export const QRButton = forwardRef<HTMLButtonElement, IQRButtonProps>(
  ({ children, href, disabled = false, ...props }, ref) => {
    const [showPopover, setShowPopover] = useState(false);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();

        customProtocolCheck(
          href,
          () => {
            // Protocol handler not found
            setShowPopover(true);
          },
          () => {
            // Protocol handler found, wallet is opening
          },
          2500,
          () => {
            // Browser doesn't support detection, fall back to direct navigation
            window.location.href = href;
          }
        );
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
                    tabIndex={-1}
                    disabled={disabled}
                    className={cn("px-3 rounded-tr-none rounded-br-none", props.variant === "link" ? "px-1" : "px-3")}
                  >
                    <QrCode className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px]">
                <p>Send the transaction from your mobile phone</p>
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
        <Popover open={showPopover} onOpenChange={setShowPopover}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    {...props}
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
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px]">
                <p>This will open your Obyte wallet installed on this computer and send the transaction</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <PopoverContent side="bottom" className="text-sm bg-white text-black border-white shadow-lg">
            <PopoverArrow className="fill-white" />
            This link opens Obyte wallet. Not installed? Download it from{" "}
            <a href="https://obyte.org/#download" target="_blank" rel="noopener" className="text-link">obyte.org</a>.
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);
