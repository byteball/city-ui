/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly AA_ADDRESS: string;
  readonly TESTNET: "true" | "false";
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

