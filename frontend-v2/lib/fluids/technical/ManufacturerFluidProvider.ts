import type {
  FluidTechnicalDataProvider,
  FluidTechnicalQuery,
  FluidTechnicalResult,
} from "./FluidTechnicalDataProvider";

export type FluidManufacturer =
  | "castrol"
  | "liqui-moly"
  | "shell"
  | "other";

export class ManufacturerFluidProvider
implements FluidTechnicalDataProvider {

  readonly id: string;

  constructor(
    readonly manufacturer:
      FluidManufacturer,
  ) {

    this.id =
      `manufacturer-fluid-${manufacturer}`;
  }

  async resolve(
    _query: FluidTechnicalQuery,
  ): Promise<FluidTechnicalResult> {

    /*
     * Connecteur volontairement vide.
     *
     * Il pourra recevoir plus tard :
     * - API officielle ;
     * - fichier sous licence ;
     * - autre integration autorisee.
     *
     * Pas de scraping automatique ici.
     */
    return {
      status:
        "provider-unavailable",
    };
  }

}