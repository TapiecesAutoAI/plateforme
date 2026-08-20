import type {
  KnowledgePackage,
  KnowledgePart,
  KnowledgeRule,
} from "../knowledgeTypes";

import {
  chargingEvidences,
  chargingHypotheses,
  chargingParts,
  chargingRules,
} from "./index";

function resolvePartName(
  partId: string,
): string {
  const part =
    chargingParts.find(
      candidate =>
        candidate.id ===
        partId,
    );

  if (!part) {
    throw new Error(
      `Pièce Charging introuvable : ${partId}.`,
    );
  }

  return part.name;
}

function convertRules():
  KnowledgeRule[] {
  return chargingRules.map(
    rule => {
      if (
        rule.effect ===
        "eliminate"
      ) {
        throw new Error(
          [
            "Effet Charging non supporté par le moteur générique.",
            `Règle : ${rule.id}.`,
            'Effet : "eliminate".',
          ].join(" "),
        );
      }

      return {
        id:
          rule.id,

        evidenceId:
          rule.evidenceId,

        hypothesisId:
          rule.hypothesisId,

        effect:
          rule.effect,

        weight:
          rule.weight,
      };
    },
  );
}

function convertParts():
  KnowledgePart[] {
  return chargingParts.map(
    part => ({
      id:
        part.id,

      name:
        part.name,

      category:
        part.category,

      saleLabel:
        part.saleLabel,

      requiresVehicleIdentification:
        part.requiresVehicleIdentification,

      purchaseWarning:
        part.purchaseWarning,
    }),
  );
}

export function createChargingKnowledgePackage():
  KnowledgePackage {
  return {
    domain:
      "charging",

    actions:
      [],

    evidences:
      chargingEvidences.map(
        evidence => ({
          id:
            evidence.id,

          label:
            evidence.label,

          defaultConfidence:
            evidence.reliability,
        }),
      ),

    hypotheses:
      chargingHypotheses.map(
        hypothesis => {
          const partIds = [
            ...(
              hypothesis.primaryPartId
                ? [
                    hypothesis.primaryPartId,
                  ]
                : []
            ),
            ...hypothesis
              .alternativePartIds,
          ];

          return {
            id:
              hypothesis.id,

            label:
              hypothesis.label,

            explanation:
              hypothesis.description,

            possibleParts:
              partIds.map(
                resolvePartName,
              ),

            recommendedChecks: [
              ...hypothesis
                .recommendedChecks,
            ],
          };
        },
      ),

    rules:
      convertRules(),

    parts:
      convertParts(),

    workflow: {
      id:
        "charging",

      title:
        "Diagnostic du circuit de charge",

      entryActionId:
        "",

      locked:
        false,
    },
  };
}