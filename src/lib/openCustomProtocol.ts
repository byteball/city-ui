import customProtocolCheck from "custom-protocol-check";

interface IOpenCustomProtocolOptions {
  href: string;
  onProtocolMissing: () => void;
  onProtocolFound?: () => void;
  timeoutMs?: number;
}

const isMobileSafari = () => {
  const ua = window.navigator.userAgent;
  const isIOS =
    /iP(hone|ad|od)/i.test(ua) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
  const isSafari = /Safari/i.test(ua) && !/(CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser)/i.test(ua);

  return isIOS && isSafari;
};

const openInMobileSafari = (href: string, onProtocolMissing: () => void, timeoutMs: number) => {
  let appOpened = false;
  let timeoutId = 0;

  const cleanup = () => {
    window.clearTimeout(timeoutId);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("pagehide", onPageHide);
  };

  const markOpened = () => {
    appOpened = true;
    cleanup();
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      markOpened();
    }
  };

  const onPageHide = () => {
    markOpened();
  };

  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("pagehide", onPageHide, { once: true });

  timeoutId = window.setTimeout(() => {
    cleanup();
    if (!appOpened) {
      onProtocolMissing();
    }
  }, timeoutMs);

  window.location.href = href;
};

export const openCustomProtocol = ({
  href,
  onProtocolMissing,
  onProtocolFound,
  timeoutMs = 2000,
}: IOpenCustomProtocolOptions) => {
  if (isMobileSafari()) {
    openInMobileSafari(href, onProtocolMissing, timeoutMs);
    return;
  }

  customProtocolCheck(
    href,
    () => {
      onProtocolMissing();
    },
    () => {
      onProtocolFound?.();
    },
    timeoutMs,
    () => {
      window.location.href = href;
    }
  );
};

