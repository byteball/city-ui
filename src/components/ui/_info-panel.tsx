import cn from "classnames";
import { Children, cloneElement, FC, isValidElement, ReactNode } from "react";

import { Skeleton } from "./skeleton";
import { TextScramble } from "./text-scramble";

interface InfoPanelProps {
  children: ReactNode;
  className?: string;
  labelAnimated?: boolean;
}

const InfoPanel: FC<InfoPanelProps> & { Item: typeof InfoPanelItem } = ({ children, className = "", labelAnimated = false }) => {
  const enhancedChildren = Children.map(children, (child) => {
    if (isValidElement<{ labelAnimated?: boolean }>(child)) {
      return cloneElement(child, { labelAnimated });
    }

    return child;
  });

  return <div className={cn("grid gap-1 mb-4", className)}>{enhancedChildren}</div>;
};

interface InfoPanelItemProps {
  label?: string;
  children: ReactNode;
  tooltip?: ReactNode;
  loading?: boolean;
  labelAnimated?: boolean;
}

const InfoPanelItem: FC<InfoPanelItemProps> = ({ label, children, labelAnimated = false, loading = false }) => {
  const LabelWrapper = labelAnimated ? TextScramble : "div";

  return (
    <div className="flex items-center space-x-2">
      {label ? <LabelWrapper>{`${label}: `}</LabelWrapper> : null}
      {loading ? <Skeleton className="h-[1.125rem] w-[150px]" /> : <div>{children}</div>}
    </div>
  );
};

InfoPanelItem.displayName = "InfoPanelItem";
InfoPanel.displayName = "InfoPanel";

InfoPanel.Item = InfoPanelItem;

export { InfoPanel };

