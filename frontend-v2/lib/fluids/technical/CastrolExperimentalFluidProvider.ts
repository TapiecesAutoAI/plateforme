import type {
  FluidTechnicalDataProvider,
  FluidTechnicalQuery,
  FluidTechnicalResult,
} from "./FluidTechnicalDataProvider";

/*
 * EXPERIMENTAL ONLY
 *
 * Ce provider ne scrape PAS Castrol.
 *
 * Les donnees presentes ici servent uniquement
 * a valider le pipeline technique TPA avec un
 * cas temoin verifie manuellement.
 *
 * Ne pas utiliser comme base de production.
 */

export class CastrolExperimentalFluidProvider
  implements FluidTechnicalDataProvider {

  readonly id =
    "castrol-experimental";

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

    const isGolfVII =
      vehicle.make === "Volkswagen" &&
      vehicle.model === "Golf" &&
      vehicle.generation === "VII";

    const is16Tdi =
      vehicle.engineName === "1.6 TDI";

    if (
      !isGolfVII ||
      !is16Tdi
    ) {

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
          "5W-30",

        manufacturerSpecification: [
          "VW 504 00",
          "VW 507 00",
        ],

        capacityLitres:
          4.7,

        source:
          "manufacturer",

        sourceName:
          "Castrol Product Finder - manual experimental verification",

        confidence:
          "advisory",
      },
    };
  }
}