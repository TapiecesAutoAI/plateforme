import type {
  FluidTechnicalDataProvider,
  FluidTechnicalQuery,
  FluidTechnicalResult,
} from "./FluidTechnicalDataProvider";

export class TecAllianceFluidProvider
implements FluidTechnicalDataProvider {

  readonly id =
    "tecalliance-fluid";

  async resolve(
    _query: FluidTechnicalQuery,
  ): Promise<FluidTechnicalResult> {

    /*
     * Point de branchement futur :
     *
     * TecDoc / TecRMI / TecAlliance.
     *
     * Aucun appel fictif n'est realise
     * tant que l'acces/licence/API
     * n'est pas configure.
     */
    return {
      status:
        "provider-unavailable",
    };
  }

}