import { FC, ReactNode } from "react";
import { Link as ScrollLink } from "react-scroll";

export const FaqTitle: FC<{ children: ReactNode; scrollId: string }> = ({ children, scrollId }) => (
  <ScrollLink
    hashSpy
    spy
    smooth
    // replace history entry on hash change instead of pushing new one
    onSetActive={() => window.history.replaceState(null, "", `#${scrollId}`)}
    offset={-80}
    duration={500}
    to={scrollId}
    className="font-semibold text-white pointer-events-none text-2xl/7 faq-title"
  >
    {children}
  </ScrollLink>
);

