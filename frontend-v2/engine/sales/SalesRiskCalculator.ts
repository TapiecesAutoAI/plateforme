import type {
  PurchaseConfidence,
} from "./salesTypes";

export class SalesRiskCalculator {
  public getVerificationMessage(
    confidence:
      PurchaseConfidence,
  ): string | null {
    switch (
      confidence.decision
    ) {
      case "purchase-recommended":
        return null;

      case "verification-required":
        return (
          "Une vérification simple supplémentaire est recommandée avant de commander cette pièce."
        );

      case "purchase-not-recommended":
        return (
          "Le risque d’acheter une mauvaise pièce est encore trop élevé. Nous ne recommandons pas l’achat pour le moment."
        );
    }
  }
}
