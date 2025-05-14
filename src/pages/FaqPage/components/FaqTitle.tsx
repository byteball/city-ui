import { FC, ReactNode } from "react";
import { Link as ScrollLink } from "react-scroll";

export const FaqTitle: FC<{ children: ReactNode; scrollId: string }> = ({ children, scrollId }) => (
  <ScrollLink
    hashSpy
    spy
    smooth
    saveHashHistory={true}
    offset={-80}
    duration={500}
    to={scrollId}
    className="font-semibold text-white cursor-pointer text-2xl/7"
  >
    {children}
  </ScrollLink>
);

