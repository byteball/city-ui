import { type VariantProps } from "class-variance-authority";
import customProtocolCheck from "custom-protocol-check";
import { forwardRef, useCallback, useState } from "react";

import cn from "classnames";
import { buttonVariants } from "./button";
import { Popover, PopoverArrow, PopoverContent, PopoverTrigger } from "./popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

interface ILinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof buttonVariants> {
  href: string;
  disabled?: boolean;
}

export const LinkButton = forwardRef<HTMLAnchorElement, ILinkButtonProps>(
  ({ children, href, variant = "link", size, disabled = false, className, onClick, tabIndex, ...props }, ref) => {
    const [showPopover, setShowPopover] = useState(false);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (disabled) {
          e.preventDefault();
          return;
        }

        onClick?.(e);
        if (e.defaultPrevented) return;

        e.preventDefault();

        customProtocolCheck(
          'unreal' + href,
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
      [disabled, href, onClick]
    );

    return (
      <Popover open={showPopover} onOpenChange={setShowPopover}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <a
                  {...props}
                  href={href}
                  ref={ref}
                  onClick={handleClick}
                  aria-disabled={disabled}
                  tabIndex={disabled ? -1 : tabIndex}
                  className={cn(className, "cursor-pointer", {
                    "pointer-events-none opacity-50 select-none": disabled,
                  })}
                >
                  {children}
                </a>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent className="max-w-[250px]">
              <p>This will open your Obyte wallet installed on this computer and send the transaction</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <PopoverContent side="bottom" className="text-sm text-black bg-white border-white shadow-lg">
          <PopoverArrow className="fill-white" />
          <div>This link opens Obyte wallet.</div>
          <div>
            Not installed? Download it from{" "}
            <a href="https://obyte.org/#download" target="_blank" rel="noopener" className="text-link">
              obyte.org
            </a>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);
