import type {
  PurchaseConfidence,
  PurchaseDecision,
  PurchaseRisk,
} from "./salesTypes";

function getDecision(
  score: number,
): PurchaseDecision {
  if (
    score >= 0.85
  ) {
    return "purchase-recommended";
  }

  if (
    score >= 0.60
  ) {
    return "verification-required";
  }

  return "purchase-not-recommended";
}

function getRisk(
  score: number,
): PurchaseRisk {
  if (
    score >= 0.85
  ) {
    return "low";
  }

  if (
    score >= 0.60
  ) {
    return "medium";
  }

  return "high";
}

function getStars(
  score: number,
): number {
  if (
    score >= 0.90
  ) {
    return 5;
  }

  if (
    score >= 0.80
  ) {
    return 4;
  }

  if (
    score >= 0.65
  ) {
    return 3;
  }

  if (
    score >= 0.50
  ) {
    return 2;
  }

  return 1;
}

function getLabel(
  decision: PurchaseDecision,
): string {
  switch (
    decision
  ) {
    case "purchase-recommended":
      return "✅ Achat conseillé";

    case "verification-required":
      return "⚠ Vérification conseillée avant achat";

    case "purchase-not-recommended":
      return "❌ Achat déconseillé pour le moment";
  }
}

export class PurchaseConfidenceCalculator {
  public calculate(
    score: number,
  ): PurchaseConfidence {
    const normalizedScore =
      Math.max(
        0,
        Math.min(
          score,
          0.97,
        ),
      );

    const decision =
      getDecision(
        normalizedScore,
      );

    return {
      score:
        normalizedScore,

      decision,

      risk:
        getRisk(
          normalizedScore,
        ),

      stars:
        getStars(
          normalizedScore,
        ),

      label:
        getLabel(
          decision,
        ),
    };
  }
}
