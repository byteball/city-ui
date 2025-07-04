import { FC } from "react";

interface IFooterProps { }

export const Footer: FC<IFooterProps> = () => (
  <div className="py-4 text-center text-foreground">
    <a href="https://obyte.org" target="_blank" rel="noopener">
      Built on Obyte
    </a>
  </div>
);

