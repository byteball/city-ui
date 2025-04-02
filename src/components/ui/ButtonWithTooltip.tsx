import { forwardRef } from "react";

import { Button, ButtonProps } from "./button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

export const ButtonWithTooltip = forwardRef<HTMLButtonElement, ButtonProps & { tooltipText?: string }>(
  ({ className, variant, size, asChild = false, tooltipText, ...props }, ref) => {
    if (!tooltipText) {
      return (
        <Button className={className} variant={variant} size={size} asChild={asChild} ref={ref} {...props}></Button>
      );
    }

    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger>
            <Button className={className} variant={variant} size={size} ref={ref} {...props}></Button>
          </TooltipTrigger>
          <TooltipContent>{tooltipText}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

ButtonWithTooltip.displayName = "ButtonWithTooltip";

