import {
  TaPiecesAutoDataStore,
} from "./TaPiecesAutoDataStore";

declare global {
  var __tapiecesautoDataStore:
    TaPiecesAutoDataStore | undefined;
}

export const dataStore =
  globalThis.__tapiecesautoDataStore ??
  new TaPiecesAutoDataStore();

globalThis.__tapiecesautoDataStore =
  dataStore;
