import type {
  FluidTechnicalDataProvider,
  FluidTechnicalQuery,
  FluidTechnicalResult,
} from "./FluidTechnicalDataProvider";

export class LocalFluidTechnicalDataProvider
implements FluidTechnicalDataProvider {

  readonly id =
    "local-fluid-technical";

  async resolve(
    query: FluidTechnicalQuery,
  ): Promise<FluidTechnicalResult> {

    const vehicle =
      query.vehicle;

    const missing: string[] = [];

    if (
      !vehicle.vin &&
      !vehicle.make
    ) {
      missing.push(
        "marque",
      );
    }

    if (
      !vehicle.vin &&
      !vehicle.model
    ) {
      missing.push(
        "modele",
      );
    }

    if (
      !vehicle.vin &&
      !vehicle.engineName
    ) {
      missing.push(
        "motorisation",
      );
    }

    if (
      missing.length > 0
    ) {

      return {
        status:
          "vehicle-required",

        missing,
      };
    }

    /*
     * IMPORTANT :
     *
     * aucune specification automobile
     * n'est inventee localement.
     *
     * Cette base sera alimentee uniquement
     * par des donnees verifiees/licenciees.
     */
    return {
      status:
        "not-found",
    };
  }

}