import { FC } from "react";

interface IFooterProps {}

export const Footer: FC<IFooterProps> = () => {
  return <div className="py-4 text-center text-foreground">&copy; Obyte 2025</div>;
};

