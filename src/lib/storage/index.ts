import "server-only";
import { appsScriptDriver } from "./apps-script";
import { localDriver } from "./local";
import type { Storage } from "./types";

// STORAGE_DRIVER picks the backend: "apps-script" (Google Sheet + Drive, used
// in production) or "local" (JSON file + public/uploads, for development).
function pick(): Storage {
  const driver = process.env.STORAGE_DRIVER ?? "local";
  switch (driver) {
    case "local":
      return localDriver;
    case "apps-script":
      return appsScriptDriver;
    default:
      throw new Error(`Unknown STORAGE_DRIVER: ${driver}`);
  }
}

export const storage = pick();
export type { Storage, StoredFile, UploadInput } from "./types";
