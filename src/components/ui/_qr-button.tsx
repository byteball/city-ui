import customProtocolCheck from "custom-protocol-check";
import { QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { forwardRef, useCallback, useState } from "react";

import cn from "classnames";
import { Button, ButtonProps } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Popover, PopoverArrow, PopoverContent, PopoverTrigger } from "./popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

interface IQRButtonProps extends ButtonProps {
  href: string;
}

const isMobileSafari = () => {
  const ua = window.navigator.userAgent;
  const isIOS =
    /iP(hone|ad|od)/i.test(ua) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
  const isSafari = /Safari/i.test(ua) && !/(CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser)/i.test(ua);

  return isIOS && isSafari;
};

export const QRButton = forwardRef<HTMLButtonElement, IQRButtonProps>(
  ({ children, href, variant, disabled = false, ...props }, ref) => {
    const [showPopover, setShowPopover] = useState(false);

    const openInMobileSafari = useCallback(() => {
      let appOpened = false;
      let timeoutId = 0;

      const cleanup = () => {
        window.clearTimeout(timeoutId);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        window.removeEventListener("pagehide", onPageHide);
      };

      const markOpened = () => {
        appOpened = true;
        cleanup();
      };

      const onVisibilityChange = () => {
        if (document.visibilityState === "hidden") {
          markOpened();
        }
      };

      const onPageHide = () => {
        markOpened();
      };

      document.addEventListener("visibilitychange", onVisibilityChange);
      window.addEventListener("pagehide", onPageHide, { once: true });

      timeoutId = window.setTimeout(() => {
        cleanup();
        if (!appOpened) {
          setShowPopover(true);
        }
      }, 2000);

      window.location.href = href;
    }, [href]);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();

        if (isMobileSafari()) {
          openInMobileSafari();
          return;
        }

        customProtocolCheck(
          href,
          () => {
            // Protocol handler not found
            setShowPopover(true);
          },
          () => {
            // Protocol handler found, wallet is opening
          },
          2000,
          () => {
            // Browser doesn't support detection, fall back to direct navigation
            window.location.href = href;
          }
        );
      },
      [href, openInMobileSafari]
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
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px]">
                <p>This will open your Obyte wallet installed on this computer and send the transaction</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <PopoverContent side="bottom" className="text-sm text-black bg-white border-white shadow-lg">
            <PopoverArrow className="fill-white" />
            <div>This {variant === "link" ? "link" : "button"} opens Obyte wallet.</div>
            <div>Not installed? Download it from{" "}
              <a href="https://obyte.org/#download" target="_blank" rel="noopener" className="text-link">obyte.org</a>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);
