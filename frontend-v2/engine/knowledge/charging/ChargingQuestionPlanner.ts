import {
  Profiles,
  type UserProfile,
} from "../../profiles";

import {
  chargingQuestions,
} from "./questions";

import type {
  ChargingQuestion,
  ChargingQuestionCandidate,
} from "./reasoningTypes";

function mapProfileToAudience(
  profile: UserProfile,
):
  | "particulier"
  | "bricoleur"
  | "vendeur-pieces-auto"
  | "mecanicien-garage"
  | "depanneur" {
  switch (
    profile
  ) {
    case "vendeur":
      return "vendeur-pieces-auto";

    case "garage":
      return "mecanicien-garage";

    default:
      return profile;
  }
}

export class ChargingQuestionPlanner {
  public selectNextQuestion(
    profile: UserProfile,

    knownEvidenceIds: string[],

    completedQuestionIds: string[] = [],

    activeHypothesisIds: string[] = [],
  ): ChargingQuestionCandidate | null {
    const settings =
      Profiles[profile];

    const audience =
      mapProfileToAudience(
        profile,
      );

    const knownEvidence =
      new Set(
        knownEvidenceIds,
      );

    const completedQuestions =
      new Set(
        completedQuestionIds,
      );

    const candidates =
      chargingQuestions
        .filter(
          (question) =>
            !completedQuestions.has(
              question.id,
            ),
        )
        .filter(
          (question) =>
            question.audiences.includes(
              audience,
            ),
        )
        .filter(
          (question) =>
            !question.requiresMeasurement ||
            settings.allowMeasurements,
        )
        .filter(
          (question) =>
            question.difficulty <=
            settings.technicalLevel,
        )
        .filter(
          (question) =>
            (
              question.requiredEvidenceIds ??
              []
            ).every(
              (evidenceId) =>
                knownEvidence.has(
                  evidenceId,
                ),
            ),
        )
        .filter(
          (question) =>
            !(
              question.forbiddenEvidenceIds ??
              []
            ).some(
              (evidenceId) =>
                knownEvidence.has(
                  evidenceId,
                ),
            ),
        )
        .map(
          (
            question,
          ): ChargingQuestionCandidate => {
            const reasons:
              string[] = [];

            let score =
              question.baseInformationGain *
              100;

            if (
              question.requiresMeasurement
            ) {
              score -=
                profile === "particulier"
                  ? 100
                  : 4;

              reasons.push(
                "Question nécessitant une mesure.",
              );
            }

            score -=
              question.difficulty *
              2;

            score -=
              Math.min(
                question.estimatedSeconds /
                  30,
                8,
              );

            if (
              activeHypothesisIds.length >
              0
            ) {
              const matchingTargets =
                question.targetHypothesisIds.filter(
                  (hypothesisId) =>
                    activeHypothesisIds.includes(
                      hypothesisId,
                    ),
                ).length;

              score +=
                matchingTargets *
                8;

              if (
                matchingTargets >
                0
              ) {
                reasons.push(
                  "La question départage les hypothèses encore actives.",
                );
              }
            }

            const evidenceAlreadyKnown =
              question.options
                .flatMap(
                  (option) =>
                    option.addsEvidenceIds,
                )
                .filter(
                  (evidenceId) =>
                    knownEvidence.has(
                      evidenceId,
                    ),
                ).length;

            score -=
              evidenceAlreadyKnown *
              20;

            if (
              evidenceAlreadyKnown >
              0
            ) {
              reasons.push(
                "Une partie de l’information est déjà connue.",
              );
            }

            reasons.push(
              `Gain d’information initial : ${Math.round(
                question.baseInformationGain *
                  100,
              )} %.`,
            );

            return {
              question,

              score,

              reasons,
            };
          },
        )
        .sort(
          (
            first,
            second,
          ) =>
            second.score -
            first.score,
        );

    return (
      candidates[0] ??
      null
    );
  }

  public getAvailableQuestions(
    profile: UserProfile,
  ): ChargingQuestion[] {
    const audience =
      mapProfileToAudience(
        profile,
      );

    const settings =
      Profiles[profile];

    return chargingQuestions.filter(
      (question) =>
        question.audiences.includes(
          audience,
        ) &&
        (
          !question.requiresMeasurement ||
          settings.allowMeasurements
        ) &&
        question.difficulty <=
          settings.technicalLevel,
    );
  }
}
