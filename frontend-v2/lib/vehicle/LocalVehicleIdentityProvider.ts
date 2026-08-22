import type {
  VehicleIdentityProvider,
  VehicleIdentityResult,
} from "./VehicleIdentityProvider";

export class LocalVehicleIdentityProvider
implements VehicleIdentityProvider {

  async resolveVin(
    vin: string,
  ): Promise<VehicleIdentityResult> {

    /*
     * Aucun faux decodage VIN local.
     *
     * Plus tard, cette implementation sera remplacee
     * ou completee par TecDoc / TecAlliance.
     */
    return {
      status:
        "provider-unavailable",

      vin,
    };
  }

}