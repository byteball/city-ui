import { FC, ReactNode } from "react";
import { Skeleton } from "./skeleton";

interface InfoPanelProps {
  children: ReactNode;
}

const InfoPanel: FC<InfoPanelProps> & { Item: typeof InfoPanelItem } = ({ children }) => {
  return <div className="grid gap-1 mb-4">{children}</div>;
};

interface InfoPanelItemProps {
  label: string;
  children: ReactNode;
  tooltip?: ReactNode;
  loading?: boolean;
}

const InfoPanelItem: FC<InfoPanelItemProps> = ({ label, children, loading = false }) => {
  return (
    <div className="flex items-center space-x-2">
      <div>{label}: </div>
      {loading ? <Skeleton className="h-[1.125rem] w-[150px]" /> : <div>{children}</div>}
    </div>
  );
};

InfoPanelItem.displayName = "InfoPanelItem";
InfoPanel.displayName = "InfoPanel";

InfoPanel.Item = InfoPanelItem;

export { InfoPanel };

