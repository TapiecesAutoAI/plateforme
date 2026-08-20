import type {
  KnowledgePackage,
} from "../knowledge";

import type {
  ReasoningProfileId,
} from "../model";

import type {
  ReasoningV2Result,
} from "../reasoning/ReasoningEngine";

export type PartRecommendationV2Status =
  | "recommended"
  | "verify-before-purchase"
  | "insufficient-confidence"
  | "no-part-required";

export interface PartRecommendationV2 {
  partName: string;
  score: number;
  rank: number;
  linkedHypothesisIds: string[];
  reason: string;
}

export interface PartRecommendationV2Result {
  status: PartRecommendationV2Status;
  primaryPart: PartRecommendationV2 | null;
  alternatives: PartRecommendationV2[];
  confidence: number;
  verificationRequired: boolean;
  verificationMessage: string | null;
}

interface ProfileRecommendationStrategy {
  recommendationThreshold: number;
  verificationThreshold: number;
  alternativeThreshold: number;
  maximumAlternatives: number;
  primaryPartWeight: number;
  alternativePartWeight: number;
  recommendedReason: string;
  verificationMessage: string;
  insufficientMessage: string;
}

const PROFILE_STRATEGIES:
  Record<
    ReasoningProfileId,
    ProfileRecommendationStrategy
  > = {
    particulier: {
      recommendationThreshold:
        0.86,
      verificationThreshold:
        0.60,
      alternativeThreshold:
        0.18,
      maximumAlternatives:
        1,
      primaryPartWeight:
        1,
      alternativePartWeight:
        0.20,
      recommendedReason:
        "Cette pièce est la cause la plus probable d'après vos réponses.",
      verificationMessage:
        "Une vérification simple est encore conseillée avant d'acheter cette pièce.",
      insufficientMessage:
        "Le risque d'acheter une mauvaise pièce est encore trop élevé.",
    },

    bricoleur: {
      recommendationThreshold:
        0.82,
      verificationThreshold:
        0.55,
      alternativeThreshold:
        0.15,
      maximumAlternatives:
        2,
      primaryPartWeight:
        1,
      alternativePartWeight:
        0.25,
      recommendedReason:
        "Cette pièce correspond le mieux aux symptômes et aux contrôles effectués.",
      verificationMessage:
        "Un contrôle complémentaire simple est recommandé avant l'achat.",
      insufficientMessage:
        "Les éléments disponibles ne permettent pas encore de sécuriser l'achat.",
    },

    "vendeur-pieces-auto": {
      recommendationThreshold:
        0.90,
      verificationThreshold:
        0.68,
      alternativeThreshold:
        0.12,
      maximumAlternatives:
        3,
      primaryPartWeight:
        1,
      alternativePartWeight:
        0.30,
      recommendedReason:
        "Cette pièce présente le meilleur rapport entre probabilité de panne et risque de retour.",
      verificationMessage:
        "Vérifier l'identification du véhicule et la seconde hypothèse avant de confirmer la vente.",
      insufficientMessage:
        "Le risque de retour reste trop élevé pour conseiller cette pièce.",
    },

    "mecanicien-garage": {
      recommendationThreshold:
        0.92,
      verificationThreshold:
        0.70,
      alternativeThreshold:
        0.10,
      maximumAlternatives:
        3,
      primaryPartWeight:
        1,
      alternativePartWeight:
        0.35,
      recommendedReason:
        "Cette pièce est liée aux hypothèses les mieux soutenues par les observations disponibles.",
      verificationMessage:
        "Confirmer par un contrôle technique ciblé avant remplacement.",
      insufficientMessage:
        "Le diagnostic reste insuffisamment discriminant pour justifier le remplacement.",
    },

    depanneur: {
      recommendationThreshold:
        0.84,
      verificationThreshold:
        0.58,
      alternativeThreshold:
        0.15,
      maximumAlternatives:
        2,
      primaryPartWeight:
        1,
      alternativePartWeight:
        0.25,
      recommendedReason:
        "Cette pièce est la cause la plus probable pour orienter l'intervention immédiate.",
      verificationMessage:
        "Effectuer d'abord le contrôle le plus rapide permettant de confirmer la remise en route.",
      insufficientMessage:
        "La pièce ne doit pas être remplacée sans contrôle supplémentaire.",
    },
  };

interface MutablePartScore {
  score: number;
  hypothesisIds: string[];
}

export class PartRecommendationEngineV2 {
  public recommend(
    knowledge: KnowledgePackage,
    reasoning: ReasoningV2Result,
    profileId:
      ReasoningProfileId =
        "particulier",

    vinValidated:
      boolean = false,
  ): PartRecommendationV2Result {
    const strategy =
      PROFILE_STRATEGIES[
        profileId
      ];

    const partScores =
      new Map<
        string,
        MutablePartScore
      >();

    for (
      const probability
      of reasoning.decision
        .probabilities
    ) {
      if (
        probability.probability <=
        0
      ) {
        continue;
      }

      const hypothesisId =
        probability.hypothesis.id;

      const definition =
        knowledge.hypotheses.find(
          hypothesis =>
            hypothesis.id ===
            hypothesisId,
        );

      if (
        !definition ||
        definition.possibleParts
          .length ===
          0
      ) {
        continue;
      }

      definition.possibleParts.forEach(
        (
          partName,
          index,
        ) => {
          const current =
            partScores.get(
              partName,
            ) ?? {
              score: 0,
              hypothesisIds: [],
            };

          const weight =
            index === 0
              ? strategy
                  .primaryPartWeight
              : strategy
                  .alternativePartWeight;

          current.score +=
            probability.probability *
            weight;

          if (
            !current
              .hypothesisIds
              .includes(
                hypothesisId,
              )
          ) {
            current
              .hypothesisIds
              .push(
                hypothesisId,
              );
          }

          partScores.set(
            partName,
            current,
          );
        },
      );
    }

    const rankedParts =
      [
        ...partScores.entries(),
      ]
        .map(
          (
            [
              partName,
              data,
            ],
          ) => ({
            partName,
            rawScore:
              data.score,
            linkedHypothesisIds:
              data.hypothesisIds,
          }),
        )
        .sort(
          (
            first,
            second,
          ) =>
            second.rawScore -
            first.rawScore,
        );

    const normalizedParts:
      PartRecommendationV2[] =
      rankedParts.map(
        (
          part,
          index,
        ) => ({
          partName:
            part.partName,

          score:
            Math.min(
              part.rawScore,
              0.97,
            ),

          rank:
            index + 1,

          linkedHypothesisIds:
            [
              ...part
                .linkedHypothesisIds,
            ],

          reason:
            strategy
              .recommendedReason,
        }),
      );

    const primaryPart =
      normalizedParts[0] ??
      null;

    if (
      primaryPart ===
      null
    ) {
      return {
        status:
          "no-part-required",
        primaryPart:
          null,
        alternatives:
          [],
        confidence:
          0,
        verificationRequired:
          true,
        verificationMessage:
          "Aucune pièce ne peut être recommandée avec les informations actuelles.",
      };
    }

    const leadingHypothesisId =
      reasoning.decision
        .probabilities[0]
        ?.hypothesis.id ??
      null;

    if (
      leadingHypothesisId ===
      "problem-starter-control-circuit"
    ) {
      return {
        status:
          "verify-before-purchase",

        primaryPart:
          null,

        alternatives:
          normalizedParts
            .slice(
              0,
              strategy
                .maximumAlternatives,
            ),

        confidence:
          primaryPart.score,

        verificationRequired:
          true,

        verificationMessage:
          "Le circuit de commande du démarreur est probablement en cause, mais le composant précis n'est pas encore identifié. Effectuer le contrôle électrique avant toute commande.",
      };
    }
    const alternatives =
      normalizedParts
        .slice(1)
        .filter(
          part =>
            part.score >=
            strategy
              .alternativeThreshold,
        )
        .slice(
          0,
          strategy
            .maximumAlternatives,
        );

    const knowledgeParts =
      (
        knowledge as KnowledgePackage & {
          parts?: readonly {
            name: string;
            requiresVehicleIdentification?:
              boolean;
          }[];
        }
      ).parts ??
      [];

    const vehicleIdentificationRequired =
      knowledgeParts.some(
        part =>
          part.name ===
            primaryPart.partName &&
          part.requiresVehicleIdentification ===
            true,
      );

    const confidence =
      primaryPart.score;

    if (
      confidence >=
      strategy
        .recommendationThreshold
    ) {
      return {
        status:
          "recommended",
        primaryPart,
        alternatives,
        confidence,
        verificationRequired:
          (vehicleIdentificationRequired &&
            !vinValidated) ||
          profileId ===
            "vendeur-pieces-auto" ||
          profileId ===
            "mecanicien-garage",

        verificationMessage:
          vehicleIdentificationRequired &&
            !vinValidated
            ? "Confirmer la compatibilité par le VIN ou la référence constructeur."
            : profileId ===
                "vendeur-pieces-auto"
              ? "Confirmer la compatibilité par le VIN ou la référence constructeur."
              : profileId ===
                  "mecanicien-garage"
                ? "Confirmer la panne avant remplacement définitif."
                : null,
      };
    }

    if (
      confidence >=
      strategy
        .verificationThreshold
    ) {
      return {
        status:
          "verify-before-purchase",
        primaryPart,
        alternatives,
        confidence,
        verificationRequired:
          true,
        verificationMessage:
          strategy
            .verificationMessage,
      };
    }

    return {
      status:
        "insufficient-confidence",
      primaryPart,
      alternatives,
      confidence,
      verificationRequired:
        true,
      verificationMessage:
        strategy
          .insufficientMessage,
    };
  }
}
