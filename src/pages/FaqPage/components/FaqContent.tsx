import { FC, ReactNode } from "react";
import { Element } from "react-scroll";

export const FaqContent: FC<{ children: ReactNode; scrollId: string }> = ({ children, scrollId }) => (
  <Element name={scrollId} id={scrollId} className="mt-2 text-gray-300 text-base/7 [&_a]:text-link">
    {children}
  </Element>
);

