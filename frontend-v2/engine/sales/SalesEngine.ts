import type {
  PartRecommendationResult,
} from "../parts";

import type {
  ReasoningExplanation,
} from "../reasoning";

import {
  CustomerMessageBuilder,
} from "./CustomerMessageBuilder";

import {
  PurchaseConfidenceCalculator,
} from "./PurchaseConfidenceCalculator";

import {
  SalesRiskCalculator,
} from "./SalesRiskCalculator";

import type {
  SalesRecommendation,
} from "./salesTypes";

export class SalesEngine {
  private readonly confidenceCalculator:
    PurchaseConfidenceCalculator;

  private readonly riskCalculator:
    SalesRiskCalculator;

  private readonly messageBuilder:
    CustomerMessageBuilder;

  constructor(
    confidenceCalculator =
      new PurchaseConfidenceCalculator(),

    riskCalculator =
      new SalesRiskCalculator(),

    messageBuilder =
      new CustomerMessageBuilder(),
  ) {
    this.confidenceCalculator =
      confidenceCalculator;

    this.riskCalculator =
      riskCalculator;

    this.messageBuilder =
      messageBuilder;
  }

  public createRecommendation(
    partRecommendation:
      PartRecommendationResult | null,

    explanation:
      ReasoningExplanation | null,
  ): SalesRecommendation {
    const primaryPart =
      partRecommendation
        ?.primaryPart ??
      null;

    const technicalConfidence =
      partRecommendation
        ?.confidence ??
      0;

    const calculatedConfidence =
      this.confidenceCalculator.calculate(
        technicalConfidence,
      );

    const confidence =
      partRecommendation?.status ===
        "no-part-required"
        ? this.confidenceCalculator.calculate(
            0,
          )
        : partRecommendation?.status ===
              "insufficient-confidence"
          ? {
              ...this.confidenceCalculator.calculate(
                Math.min(
                  technicalConfidence,
                  0.59,
                ),
              ),
              score:
                calculatedConfidence.score,
            }
          : (
                partRecommendation?.verificationRequired ===
                  true ||
                partRecommendation?.status ===
                  "verify-before-purchase"
              ) &&
              calculatedConfidence.decision ===
                "purchase-recommended"
            ? {
                ...this.confidenceCalculator.calculate(
                  Math.min(
                    technicalConfidence,
                    0.84,
                  ),
                ),
                score:
                  calculatedConfidence.score,
              }
            : calculatedConfidence;

    const alternativePart =
      partRecommendation
        ?.alternatives[0]
        ?.partName ??
      null;

    const verificationMessage =
      this.riskCalculator
        .getVerificationMessage(
          confidence,
        );

    const reasons =
      this.messageBuilder
        .buildReasons(
          explanation,
        );

    if (
      !primaryPart
    ) {
      return {
        partName:
          null,

        headline:
          "Aucune pièce ne peut encore être conseillée",

        confidence,

        reasons,

        alternativePart:
          null,

        verificationMessage,

        callToAction:
          "continue-diagnostic",
      };
    }

    switch (
      confidence.decision
    ) {
      case "purchase-recommended":
        return {
          partName:
            primaryPart.partName,

          headline:
            "🛒 Pièce recommandée",

          confidence,

          reasons,

          alternativePart:
            null,

          verificationMessage:
            null,

          callToAction:
            "identify-vehicle",
        };

      case "verification-required":
        return {
          partName:
            primaryPart.partName,

          headline:
            "🛒 Pièce la plus probable",

          confidence,

          reasons,

          alternativePart,

          verificationMessage,

          callToAction:
            "continue-diagnostic",
        };

      case "purchase-not-recommended":
        return {
          partName:
            primaryPart.partName,

          headline:
            "❌ Achat non recommandé pour le moment",

          confidence,

          reasons,

          alternativePart,

          verificationMessage,

          callToAction:
            "request-professional-check",
        };
    }
  }
}
