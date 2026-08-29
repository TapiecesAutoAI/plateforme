import type {
  FluidTechnicalDataProvider,
  FluidTechnicalQuery,
  FluidTechnicalResult,
} from "./FluidTechnicalDataProvider";

export class VehicleFinderProxyFluidProvider
implements FluidTechnicalDataProvider {

  readonly id =
    "vehicle-finder-proxy";

  async resolve(
    query:
      FluidTechnicalQuery,
  ): Promise<
    FluidTechnicalResult
  > {

    try {

      const response =
        await fetch(
          "/api/fluids/vehicle-finder",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body:
              JSON.stringify(
                query,
              ),

            cache:
              "no-store",
          },
        );

      if (!response.ok) {

        return {
          status:
            "provider-unavailable",
        };
      }

      return await response.json() as
        FluidTechnicalResult;

    } catch {

      return {
        status:
          "provider-unavailable",
      };
    }
  }
}