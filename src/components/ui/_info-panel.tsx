import cn from "classnames";
import { FC, ReactNode } from "react";

import { InfoIcon } from "lucide-react";
import { Skeleton } from "./skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

interface InfoPanelProps {
  children: ReactNode;
  className?: string;
  compact?: boolean;
}

const InfoPanel: FC<InfoPanelProps> & { Item: typeof InfoPanelItem } = ({
  children,
  className = "",
  compact = false
}) => {
  return <div className={cn("grid", compact ? "gap-0" : "gap-1", className)}>{children}</div>;
};

interface InfoPanelItemProps {
  label?: string;
  children: ReactNode;
  tooltipText?: string | ReactNode;
  loading?: boolean;
  textClamp?: boolean;
}

const InfoPanelItem: FC<InfoPanelItemProps> = ({
  label,
  children,
  loading = false,
  tooltipText,
  textClamp = false,
}) => {
  return (
    <div className="flex flex-col mb-2 last:mb-0 lg:mb-0 lg:space-x-2 lg:items-center lg:flex-row">
      {label ? (
        <div className="flex text-muted-foreground lg:text-white">
          <div className="font-medium text-muted-foreground">{label}</div>

          {tooltipText ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="cursor-pointer">
                  <InfoIcon className="w-3 h-3 ml-1 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="w-auto max-w-[200px]">
                  <div className="text-sm">{tooltipText}</div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <Skeleton className="h-[1.125rem] w-[150px]" />
      ) : (
        <div className={cn({ "sm:line-clamp-1": textClamp })}>{children}</div>
      )}
    </div>
  );
};

InfoPanelItem.displayName = "InfoPanelItem";
InfoPanel.displayName = "InfoPanel";

InfoPanel.Item = InfoPanelItem;

export { InfoPanel };

