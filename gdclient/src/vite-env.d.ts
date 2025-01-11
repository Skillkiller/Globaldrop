/// <reference types="vite/client" />

declare const APP_VERSION: string;

interface ImportMetaEnv {
  VITE_BACKEND_HOST: string;
  VITE_BACKEND_PORT: number;
  VITE_BACKEND_PEER_PATH: string;
  VITE_BACKEND_ROOM_PATH: string;
  VITE_BACKEND_SECURE: "true" | "false";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
