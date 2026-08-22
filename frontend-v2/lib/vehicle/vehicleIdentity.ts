import {
  LocalVehicleIdentityProvider,
} from "./LocalVehicleIdentityProvider";

import type {
  VehicleIdentityProvider,
} from "./VehicleIdentityProvider";

export type {
  VehicleIdentityProvider,
  VehicleIdentityResult,
} from "./VehicleIdentityProvider";

/*
 * Provider actif aujourd'hui :
 * LocalVehicleIdentityProvider
 *
 * Futur :
 * TecDocVehicleIdentityProvider
 */
export const vehicleIdentityProvider:
  VehicleIdentityProvider =
    new LocalVehicleIdentityProvider();