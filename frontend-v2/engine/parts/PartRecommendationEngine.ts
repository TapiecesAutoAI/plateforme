import type {
  KnowledgePackage,
} from "../knowledge";

import type {
  ReasoningProfileId,
} from "../model";

import type {
  ReasoningResult,
} from "../reasoning";

export type PartRecommendationStatus =
  | "recommended"
  | "verify-before-purchase"
  | "insufficient-confidence"
  | "no-part-required";

export type PartRecommendation = {
  partName:
    string;

  score:
    number;

  rank:
    number;

  linkedHypothesisIds:
    string[];

  reason:
    string;
};

export type PartRecommendationResult = {
  status:
    PartRecommendationStatus;

  primaryPart:
    PartRecommendation | null;

  alternatives:
    PartRecommendation[];

  confidence:
    number;

  verificationRequired:
    boolean;

  verificationMessage:
    string | null;
};

interface ProfileRecommendationStrategy {
  recommendationThreshold:
    number;

  verificationThreshold:
    number;

  alternativeThreshold:
    number;

  maximumAlternatives:
    number;

  primaryPartWeight:
    number;

  alternativePartWeight:
    number;

  recommendedReason:
    string;

  verificationMessage:
    string;

  insufficientMessage:
    string;
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
        0.6,

      alternativeThreshold:
        0.18,

      maximumAlternatives:
        1,

      primaryPartWeight:
        1,

      alternativePartWeight:
        0.2,

      recommendedReason:
        "Cette pièce est la cause la plus probable d’après vos réponses.",

      verificationMessage:
        "Une vérification simple est encore conseillée avant d’acheter cette pièce.",

      insufficientMessage:
        "Le risque d’acheter une mauvaise pièce est encore trop élevé. L’achat n’est pas recommandé pour le moment.",
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
        "Un contrôle complémentaire simple est recommandé avant l’achat.",

      insufficientMessage:
        "Les éléments disponibles ne permettent pas encore de sécuriser l’achat de cette pièce.",
    },

    "vendeur-pieces-auto": {
      recommendationThreshold:
        0.9,

      verificationThreshold:
        0.68,

      alternativeThreshold:
        0.12,

      maximumAlternatives:
        3,

      primaryPartWeight:
        1,

      alternativePartWeight:
        0.3,

      recommendedReason:
        "Cette pièce présente le meilleur rapport entre probabilité de panne et risque de retour.",

      verificationMessage:
        "Vérifier l’identification du véhicule et la seconde hypothèse avant de confirmer la vente.",

      insufficientMessage:
        "Le risque de retour reste trop élevé pour conseiller cette pièce sans contrôle supplémentaire.",
    },

    "mecanicien-garage": {
      recommendationThreshold:
        0.92,

      verificationThreshold:
        0.7,

      alternativeThreshold:
        0.1,

      maximumAlternatives:
        3,

      primaryPartWeight:
        1,

      alternativePartWeight:
        0.35,

      recommendedReason:
        "Cette pièce est liée aux hypothèses les mieux soutenues par les observations et mesures disponibles.",

      verificationMessage:
        "Confirmer par un contrôle technique ciblé avant remplacement.",

      insufficientMessage:
        "Le diagnostic reste insuffisamment discriminant pour justifier le remplacement de cette pièce.",
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
        "Cette pièce est la cause la plus probable pour orienter l’intervention immédiate.",

      verificationMessage:
        "Effectuer d’abord le contrôle le plus rapide permettant de confirmer la remise en route.",

      insufficientMessage:
        "La pièce ne doit pas être remplacée sur place sans un contrôle rapide supplémentaire.",
    },
  };

export class PartRecommendationEngine {
  public recommend(
    knowledge:
      KnowledgePackage,

    reasoning:
      ReasoningResult,

    profileId:
      ReasoningProfileId =
        "particulier",
  ): PartRecommendationResult {
    const strategy =
      PROFILE_STRATEGIES[
        profileId
      ];

    const partScores =
      new Map<
        string,
        {
          score:
            number;

          hypothesisIds:
            string[];
        }
      >();

    for (
      const hypothesis
      of reasoning.hypotheses
    ) {
      if (
        hypothesis.probability <=
        0
      ) {
        continue;
      }

      const definition =
        knowledge.hypotheses.find(
          item =>
            item.id ===
            hypothesis.id,
        );

      if (
        !definition ||
        definition.possibleParts.length ===
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
              score:
                0,

              hypothesisIds:
                [],
            };

          const weight =
            index ===
            0
              ? strategy
                  .primaryPartWeight
              : strategy
                  .alternativePartWeight;

          current.score +=
            hypothesis.probability *
            weight;

          if (
            !current.hypothesisIds.includes(
              hypothesis.id,
            )
          ) {
            current.hypothesisIds.push(
              hypothesis.id,
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

    const normalizedParts =
      rankedParts.map(
        (
          part,
          index,
        ): PartRecommendation => ({
          partName:
            part.partName,

          score:
            Math.min(
              part.rawScore,
              0.97,
            ),

          rank:
            index +
            1,

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

    const alternatives =
      normalizedParts
        .slice(
          1,
        )
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

    if (
      !primaryPart
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
          profileId ===
            "vendeur-pieces-auto" ||
          profileId ===
            "mecanicien-garage",

        verificationMessage:
          profileId ===
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
