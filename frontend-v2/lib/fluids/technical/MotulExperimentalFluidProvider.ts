import type {
  FluidTechnicalDataProvider,
  FluidTechnicalQuery,
  FluidTechnicalResult,
} from "./FluidTechnicalDataProvider";

/*
 * EXPERIMENTAL ONLY
 *
 * Donnee temoin verifiee manuellement
 * sur le selecteur officiel Motul.
 *
 * Aucun scraping automatique.
 */
export class MotulExperimentalFluidProvider
implements FluidTechnicalDataProvider {

  readonly id =
    "motul-experimental";

  async resolve(
    query: FluidTechnicalQuery,
  ): Promise<FluidTechnicalResult> {

    if (
      query.fluidId !== "engine-oil"
    ) {

      return {
        status:
          "not-found",
      };
    }

    const vehicle =
      query.vehicle;

    const matches =
      vehicle.make === "Volkswagen" &&
      vehicle.model === "Golf" &&
      vehicle.generation === "VII" &&
      vehicle.engineName === "1.6 TDI";

    if (!matches) {

      return {
        status:
          "not-found",
      };
    }

    return {
      status:
        "found",

      specification: {
        fluidId:
          "engine-oil",

        viscosity:
          "0W-30",

        manufacturerSpecification: [
          "VW 504 00",
          "VW 507 00",
        ],

        capacityLitres:
          4.7,

        source:
          "manufacturer",

        sourceName:
          "Motul Oil Selector - manual experimental verification",

        confidence:
          "advisory",
      },
    };
  }
}