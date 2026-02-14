import { type VariantProps } from "class-variance-authority";
import { forwardRef, useCallback, useState } from "react";

import { openCustomProtocol } from "@/lib/openCustomProtocol";
import cn from "classnames";
import { WalletProtocolPopover } from "./_wallet-protocol-popover";
import { buttonVariants } from "./button";

interface ILinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof buttonVariants> {
  href: string;
  disabled?: boolean;
}

export const ObyteLink = forwardRef<HTMLAnchorElement, ILinkButtonProps>(
  ({ children, href, disabled = false, className, onClick, tabIndex, ...props }, ref) => {
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

        openCustomProtocol({
          href,
          onProtocolMissing: () => {
            setShowPopover(true);
          },
        });
      },
      [disabled, href, onClick]
    );

    return (
      <WalletProtocolPopover open={showPopover} onOpenChange={setShowPopover} triggerType="link">
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
      </WalletProtocolPopover>
    );
  }
);
