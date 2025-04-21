/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AA_ADDRESS: string;
  readonly VITE_TESTNET: "true" | "false";
  readonly VITE_LAUNCH_DATE: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

