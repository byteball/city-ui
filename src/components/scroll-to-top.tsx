import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router";

export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType(); // PUSH / REPLACE / POP

  useEffect(() => {
    if (navType !== "POP" && (!pathname.startsWith("/faq") || hash)) {
      window.scrollTo({ top: 0, left: 0 });
    }
  }, [pathname, navType, hash]);

  return null;
}

