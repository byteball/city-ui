/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly AA_ADDRESS: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

