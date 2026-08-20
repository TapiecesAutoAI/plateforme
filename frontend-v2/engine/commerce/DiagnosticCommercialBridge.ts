import { PartCatalogEngine } from "../catalog";
import type { CommercialOfferResult } from "./commercialTypes";

export class DiagnosticCommercialBridge {
  private readonly catalog = new PartCatalogEngine();

  public createOffer(
    partName: string | null,
    compatibilityConfirmed = false,
  ): CommercialOfferResult {

    if (!partName) {
      return {
        status: "diagnostic-not-ready",
        diagnosticPartName: null,
        offer: null,
        salePriceIncVat: null,
        compatibilityConfirmed: false,
        canOrder: false,
        message: "Diagnostic insuffisant.",
      };
    }

    const offer =
      this.catalog.getBestOffer({
        genericPartName: partName,
      });

    if (!offer) {
      return {
        status: "no-commercial-reference",
        diagnosticPartName: partName,
        offer: null,
        salePriceIncVat: null,
        compatibilityConfirmed: false,
        canOrder: false,
        message: "Aucune référence commerciale.",
      };
    }

    const salePriceIncVat =
      offer.salePriceExVat === null
        ? null
        : Number(
            (
              offer.salePriceExVat *
              (1 + offer.vatRate)
            ).toFixed(2),
          );

    if (!compatibilityConfirmed) {
      return {
        status: "compatibility-required",
        diagnosticPartName: partName,
        offer,
        salePriceIncVat,
        compatibilityConfirmed: false,
        canOrder: false,
        message: "Compatibilité véhicule à confirmer.",
      };
    }

    const available =
      offer.stockStatus === "in-stock" ||
      offer.stockStatus === "limited" ||
      offer.stockStatus === "order";

    return {
      status: available
        ? "offer-ready"
        : "no-commercial-reference",
      diagnosticPartName: partName,
      offer,
      salePriceIncVat,
      compatibilityConfirmed: true,
      canOrder: available,
      message: available
        ? "Offre prête."
        : "Pièce indisponible.",
    };
  }
}
