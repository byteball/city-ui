import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router";

export function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType(); // PUSH / REPLACE / POP

  useEffect(() => {
    if (navType !== "POP") window.scrollTo({ top: 0, left: 0 });
  }, [pathname, navType]);

  return null;
}

