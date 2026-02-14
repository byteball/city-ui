import { type ReactElement } from "react";

import { Popover, PopoverArrow, PopoverContent, PopoverTrigger } from "./popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

interface IWalletProtocolPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerType?: "link" | "button";
  tooltipText?: string;
  children: ReactElement;
}

export const WalletProtocolPopover = ({
  open,
  onOpenChange,
  triggerType = "link",
  tooltipText = "This will open your Obyte wallet installed on this computer and send the transaction",
  children,
}: IWalletProtocolPopoverProps) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              {children}
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent className="max-w-[250px]">
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent side="bottom" className="text-sm text-black bg-white border-white shadow-lg">
        <PopoverArrow className="fill-white" />
        <div>This {triggerType} opens Obyte wallet.</div>
        <div>
          Not installed? Download it from{" "}
          <a href="https://obyte.org/#download" target="_blank" rel="noopener" className="text-link">
            obyte.org
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
};

