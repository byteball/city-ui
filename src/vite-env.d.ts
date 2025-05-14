/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AA_ADDRESS: string;
  readonly VITE_TESTNET: "true" | "false";
  readonly VITE_LAUNCH_DATE: string;
  readonly VITE_OG_IMAGE_URL: string | undefined;

  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

