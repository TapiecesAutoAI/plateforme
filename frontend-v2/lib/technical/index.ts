import {
  LocalTechnicalDataProvider,
} from "./LocalTechnicalDataProvider";

import type {
  TechnicalDataProvider,
} from "./TechnicalDataProvider";

export type {
  TechnicalDataProvider,
  TechnicalDataResult,
  TechnicalOperationRequest,
  TechnicalVehicle,
} from "./TechnicalDataProvider";

/*
 * Provider technique actif.
 *
 * Aujourd'hui :
 * LocalTechnicalDataProvider
 *
 * Plus tard :
 * TecRmiTechnicalDataProvider
 *
 * L'interface Outillage ne devra pas changer.
 */
export const technicalDataProvider:
  TechnicalDataProvider =
    new LocalTechnicalDataProvider();