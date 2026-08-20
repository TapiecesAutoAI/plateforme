import {
  demoCatalog,
} from "./demoCatalog";

import type {
  CatalogPartOffer,
  CatalogSearchInput,
  CatalogSearchResult,
} from "./catalogTypes";

export class PartCatalogEngine {
  public search(
    input: CatalogSearchInput,
  ): CatalogSearchResult {

    const normalizedName =
      input.genericPartName
        ?.trim()
        .toLocaleLowerCase("fr") ??
      null;

    const offers =
      demoCatalog
        .filter(
          offer =>
            offer.active,
        )
        .filter(
          offer => {
            if (
              input.genericPartId &&
              offer.genericPartId ===
                input.genericPartId
            ) {
              return true;
            }

            if (
              normalizedName &&
              offer.genericPartName
                .toLocaleLowerCase("fr") ===
                normalizedName
            ) {
              return true;
            }

            return false;
          },
        )
        .sort(
          (
            first,
            second,
          ) => {
            const firstAvailable =
              first.stockStatus ===
                "in-stock"
                ? 1
                : 0;

            const secondAvailable =
              second.stockStatus ===
                "in-stock"
                ? 1
                : 0;

            if (
              firstAvailable !==
              secondAvailable
            ) {
              return (
                secondAvailable -
                firstAvailable
              );
            }

            return (
              (first.salePriceExVat ??
                Number.MAX_SAFE_INTEGER) -
              (second.salePriceExVat ??
                Number.MAX_SAFE_INTEGER)
            );
          },
        );

    /*
     * Le catalogue de démonstration ne prétend
     * jamais confirmer une compatibilité réelle.
     *
     * La validation VIN sera branchée ensuite
     * sur le fournisseur / TecDoc.
     */
    const exactVehicleMatch =
      false;

    return {
      offers,

      exactVehicleMatch,

      requiresCompatibilityCheck:
        offers.length > 0,

      message:
        offers.length === 0
          ? "Aucune référence commerciale disponible pour cette pièce."
          : "Référence commerciale trouvée. La compatibilité véhicule doit être confirmée avant commande.",
    };
  }

  public getBestOffer(
    input: CatalogSearchInput,
  ): CatalogPartOffer | null {

    const result =
      this.search(input);

    return (
      result.offers[0] ??
      null
    );
  }
}
