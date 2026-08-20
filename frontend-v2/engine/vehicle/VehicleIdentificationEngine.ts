import type {
  VehicleIdentification,
  VehicleIdentificationResult,
} from "./vehicleTypes";

export class VehicleIdentificationEngine {

  public identify(
    input:
      Partial<VehicleIdentification>,
  ): VehicleIdentificationResult {

    const vin =
      this.clean(
        input.vin,
      );

    const brand =
      this.clean(
        input.brand,
      );

    const model =
      this.clean(
        input.model,
      );

    const engine =
      this.clean(
        input.engine,
      );

    const year =
      typeof input.year ===
        "number" &&
      Number.isFinite(
        input.year,
      )
        ? Math.floor(
            input.year,
          )
        : null;

    const vehicle:
      VehicleIdentification = {
      vin,
      brand,
      model,
      year,
      engine,
    };

    /*
     * MVP :
     * un VIN de longueur plausible
     * suffit à passer à l'étape
     * de compatibilité.
     *
     * Il ne constitue PAS encore
     * une validation TecDoc réelle.
     */
    if (
      vin &&
      vin.length >= 11
    ) {
      return {
        status:
          "identified-by-vin",

        vehicle,

        readyForCompatibilityCheck:
          true,

        message:
          "Véhicule identifié par VIN. La compatibilité de la pièce doit maintenant être vérifiée.",
      };
    }

    /*
     * Identification manuelle de secours.
     */
    if (
      brand &&
      model &&
      year &&
      engine
    ) {
      return {
        status:
          "identified-manually",

        vehicle,

        readyForCompatibilityCheck:
          true,

        message:
          "Véhicule identifié manuellement. Une vérification de compatibilité reste nécessaire.",
      };
    }

    return {
      status:
        "insufficient",

      vehicle,

      readyForCompatibilityCheck:
        false,

      message:
        "Indiquez le VIN ou complétez marque, modèle, année et motorisation.",
    };
  }

  private clean(
    value:
      string |
      null |
      undefined,
  ): string | null {

    const normalized =
      value
        ?.trim() ??
      "";

    return (
      normalized.length > 0
        ? normalized
        : null
    );
  }
}
