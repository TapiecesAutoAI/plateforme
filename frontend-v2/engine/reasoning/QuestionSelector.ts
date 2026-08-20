import type {
  DiagnosticAction,
  DiagnosticAudience,
} from "../core/actionTypes";

import type {
  KnowledgePackage,
} from "../knowledge";

import type {
  HypothesisScore,
} from "./HypothesisScorer";

import {
  ProfileStrategyEngine,
  type DiagnosticProfile,
  type DiagnosticTechnicalLevel,
} from "./profile/ProfileStrategyEngine";

import {
  QuestionCostEngine,
} from "./cost/QuestionCostEngine";

import {
  DuplicateQuestionEngine,
} from "./duplicate/DuplicateQuestionEngine";

import {
  QuestionFamilyEngine,
} from "./family/QuestionFamilyEngine";

import {
  QuestionDomainReducer,
} from "./domain/QuestionDomainReducer";

import {
  FailureTreeEngine,
} from "./failure-tree/FailureTreeEngine";

export type QuestionScore = {
  action:
    DiagnosticAction;

  informationGain:
    number;

  hypothesisCoverage:
    number;

  evidenceCoverage:
    number;

  complexityPenalty:
    number;

  priorityBonus:
    number;

  profileBonus:
    number;

  costPenalty:
    number;

  finalScore:
    number;
};

type ActionMetadata =
  DiagnosticAction & {
    family?:
      string;

    diagnosticPower?:
      number;

    estimatedTimeSeconds?:
      number;

    difficulty?:
      1 | 2 | 3 | 4 | 5;

    requiresTool?:
      boolean;

    requiresMeasurement?:
      boolean;

    technicalLevel?:
      DiagnosticTechnicalLevel;

    stopIfKnown?:
      boolean;
  };

const COMPLEXITY_PENALTY = {
  simple:
    0,

  intermediate:
    0.15,

  technical:
    0.45,
} as const;

export class QuestionSelector {
  private readonly profileStrategy =
    new ProfileStrategyEngine();

  private readonly costEngine =
    new QuestionCostEngine();

  private readonly duplicateEngine =
    new DuplicateQuestionEngine();

  private readonly familyEngine =
    new QuestionFamilyEngine();

  private readonly domainReducer =
    new QuestionDomainReducer();

  private readonly chargingDomainReducer =
    new QuestionDomainReducer({
      minimumHypothesisProbability:
        0.03,

      maximumActiveHypotheses:
        8,

      keepGeneralQuestions:
        true,
    });

  private readonly failureTree =
    new FailureTreeEngine();

  public select(
    knowledge:
      KnowledgePackage,

    hypotheses:
      HypothesisScore[],

    completedActionIds:
      string[],

    profile:
      DiagnosticAudience,

    confirmedEvidenceIds:
      string[],
  ): QuestionScore | null {
    const diagnosticProfile =
      profile as
        DiagnosticProfile;

    const strategy =
      this.profileStrategy
        .getStrategy(
          diagnosticProfile,
        );

    if (
      completedActionIds.length >=
      strategy.maximumQuestions
    ) {
      return null;
    }

    const completed =
      new Set(
        completedActionIds,
      );

    const confirmedEvidence =
      new Set(
        confirmedEvidenceIds,
      );

    const answeredFamilies =
      this.familyEngine
        .collectAnsweredFamilies(
          knowledge.actions,
          completedActionIds,
        );

    const duplicateContext = {
      completedActionIds,

      confirmedEvidenceIds,

      answeredFamilies:
        [
          ...answeredFamilies,
        ],
    };

    const activeHypotheses =
      hypotheses.filter(
        hypothesis =>
          hypothesis.probability >
          0,
      );

    const branchActions =
      knowledge.domain === "starting"
        ? this.failureTree
            .filterStartingActions(
              knowledge.actions,
              {
                confirmedEvidenceIds,
              },
            )
        : [
            ...knowledge.actions,
          ];

    console.log(
      "FailureTree :",
      branchActions.length,
      "/",
      knowledge.actions.length,
    );

    const reducer =
      knowledge.domain === "charging"
        ? this.chargingDomainReducer
        : this.domainReducer;

    const reducedActions =
      reducer.reduce(
        branchActions,
        knowledge,
        activeHypotheses,
      );

    console.log(
      "DomainReducer :",
      reducedActions.length,
    );

    const candidates =
      reducedActions
        .filter(
          action =>
            action.type !==
              "complete-diagnosis",
        )
        .filter(
          action =>
            !completed.has(
              action.id,
            ),
        )
        .filter(
          action =>
            action.audiences.includes(
              profile,
            ),
        )
        .filter(
          action =>
            this.requirementsAreMet(
              action,
              confirmedEvidence,
            ),
        )
        .filter(
          action =>
            this.isAllowedForProfile(
              diagnosticProfile,
              action,
            ),
        )
        .filter(
          action =>
            !this.familyEngine
              .isAlreadyCovered(
                action,
                answeredFamilies,
              ),
        )
        .filter(
          action =>
            !this.duplicateEngine
              .isDuplicate(
                action,
                duplicateContext,
              ),
        )
        .filter(
          action =>
            this.canProduceNewInformation(
              action,
              confirmedEvidence,
            ),
        )
        .map(
          action =>
            this.scoreAction(
              action,
              knowledge,
              activeHypotheses,
              diagnosticProfile,
            ),
        )
        .filter(
          score =>
            score.informationGain >
              0 ||
            score.evidenceCoverage >
              0,
        )
        .sort(
          (
            first,
            second,
          ) =>
            second.finalScore -
            first.finalScore,
        );

    console.log(
      "Candidates :",
      candidates.length,
    );

    return (
      candidates[0] ??
      null
    );
  }

  private isAllowedForProfile(
    profile:
      DiagnosticProfile,

    action:
      DiagnosticAction,
  ): boolean {
    const metadata =
      action as
        ActionMetadata;

    const technicalLevel =
      metadata.technicalLevel ??
      this.resolveTechnicalLevel(
        action,
      );

    const requiresMeasurement =
      metadata.requiresMeasurement ??
      action.type ===
        "request-measurement";

    const requiresTool =
      metadata.requiresTool ??
      (
        action.type ===
          "request-measurement" ||
        action.type ===
          "recommend-test"
      );

    return this.profileStrategy
      .canAskQuestion(
        profile,
        {
          technicalLevel,

          requiresMeasurement,

          requiresTool,

          estimatedTimeSeconds:
            metadata
              .estimatedTimeSeconds,

          difficulty:
            metadata.difficulty,

          audiences:
            action.audiences as
              DiagnosticProfile[],
        },
      )
      .allowed;
  }

  private resolveTechnicalLevel(
    action:
      DiagnosticAction,
  ): DiagnosticTechnicalLevel {
    if (
      action.type ===
      "request-measurement"
    ) {
      return "advanced";
    }

    if (
      action.type ===
      "recommend-test"
    ) {
      return "intermediate";
    }

    if (
      action.complexity ===
      "technical"
    ) {
      return "advanced";
    }

    if (
      action.complexity ===
      "intermediate"
    ) {
      return "intermediate";
    }

    return "simple";
  }

  private requirementsAreMet(
    action:
      DiagnosticAction,

    confirmedEvidence:
      ReadonlySet<string>,
  ): boolean {
    const requiredEvidence =
      action.requiredEvidence ??
      [];

    if (
      requiredEvidence.some(
        evidenceId =>
          !confirmedEvidence.has(
            evidenceId,
          ),
      )
    ) {
      return false;
    }

    const excludedEvidence =
      action.excludedByEvidence ??
      [];

    if (
      excludedEvidence.some(
        evidenceId =>
          confirmedEvidence.has(
            evidenceId,
          ),
      )
    ) {
      return false;
    }

    return true;
  }

  private canProduceNewInformation(
    action:
      DiagnosticAction,

    confirmedEvidence:
      ReadonlySet<string>,
  ): boolean {
    const producedEvidence =
      action.options?.flatMap(
        option => [
          ...(
            option.addsEvidence ??
            []
          ),

          ...(
            option.rejectsEvidence ??
            []
          ),
        ],
      ) ?? [];

    if (
      producedEvidence.length ===
      0
    ) {
      return false;
    }

    return producedEvidence.some(
      evidenceId =>
        !confirmedEvidence.has(
          evidenceId,
        ),
    );
  }

  private scoreAction(
    action:
      DiagnosticAction,

    knowledge:
      KnowledgePackage,

    hypotheses:
      HypothesisScore[],

    profile:
      DiagnosticProfile,
  ): QuestionScore {
    const metadata =
      action as
        ActionMetadata;

    const producedEvidenceIds =
      new Set(
        action.options?.flatMap(
          option => [
            ...(
              option.addsEvidence ??
              []
            ),

            ...(
              option.rejectsEvidence ??
              []
            ),
          ],
        ) ?? [],
      );

    const affectedHypothesisIds =
      new Set<string>();

    let weightedCoverage =
      0;

    for (
      const rule
      of knowledge.rules
    ) {
      if (
        !producedEvidenceIds.has(
          rule.evidenceId,
        )
      ) {
        continue;
      }

      affectedHypothesisIds.add(
        rule.hypothesisId,
      );

      const hypothesis =
        hypotheses.find(
          candidate =>
            candidate.id ===
            rule.hypothesisId,
        );

      weightedCoverage +=
        (
          hypothesis?.probability ??
          0
        ) *
        Math.abs(
          rule.weight,
        );
    }

    const hypothesisCoverage =
      hypotheses.length >
      0
        ? affectedHypothesisIds
            .size /
          hypotheses.length
        : 0;

    const evidenceCoverage =
      producedEvidenceIds.size;

    const primaryHypothesis =
        hypotheses[0] ??
        null;

      const secondaryHypothesis =
        hypotheses[1] ??
        null;

      let discriminationScore =
        0;

      if (
        primaryHypothesis &&
        secondaryHypothesis
      ) {
        for (
          const evidenceId
          of producedEvidenceIds
        ) {
          const primaryRule =
            knowledge.rules.find(
              rule =>
                rule.evidenceId ===
                  evidenceId &&
                rule.hypothesisId ===
                  primaryHypothesis.id,
            );

          const secondaryRule =
            knowledge.rules.find(
              rule =>
                rule.evidenceId ===
                  evidenceId &&
                rule.hypothesisId ===
                  secondaryHypothesis.id,
            );

          const primaryImpact =
            primaryRule
              ? primaryRule.effect ===
                  "contradict"
                ? -Math.abs(
                    primaryRule.weight,
                  )
                : Math.abs(
                    primaryRule.weight,
                  )
              : 0;

          const secondaryImpact =
            secondaryRule
              ? secondaryRule.effect ===
                  "contradict"
                ? -Math.abs(
                    secondaryRule.weight,
                  )
                : Math.abs(
                    secondaryRule.weight,
                  )
              : 0;

          discriminationScore +=
            Math.abs(
              primaryImpact -
              secondaryImpact,
            );
        }
      }

      const probabilityGap =
        primaryHypothesis &&
        secondaryHypothesis
          ? Math.abs(
              primaryHypothesis.probability -
              secondaryHypothesis.probability,
            )
          : 1;

      const uncertaintyFocus =
        1 -
        Math.min(
          1,
          probabilityGap,
        );

      const diagnosticPower =
      Math.min(
        100,
        Math.max(
          0,
          metadata
            .diagnosticPower ??
          60,
        ),
      ) / 100;

    const informationGain =
        (
          weightedCoverage *
          (
            1 +
            hypothesisCoverage
          ) *
          (
            0.75 +
            diagnosticPower
          )
        ) +
        (
          discriminationScore *
          (
            1 +
            uncertaintyFocus
          ) *
          1.6
        );

    const complexityPenalty =
      COMPLEXITY_PENALTY[
        action.complexity
      ];

    const priorityBonus =
      1 /
      (
        1 +
        Math.max(
          action.priority,
          0,
        )
      );

    const estimatedTimeSeconds =
      Math.max(
        5,
        metadata
          .estimatedTimeSeconds ??
        15,
      );

    const difficulty =
      metadata.difficulty ??
      (
        action.complexity ===
          "technical"
          ? 4
          : action.complexity ===
              "intermediate"
            ? 2
            : 1
      );

    const requiresMeasurement =
      metadata
        .requiresMeasurement ??
      action.type ===
        "request-measurement";

    const requiresTool =
      metadata.requiresTool ??
      (
        action.type ===
          "request-measurement" ||
        action.type ===
          "recommend-test"
      );

    const cost =
      this.costEngine.compute({
        profile,

        complexity:
          action.complexity,

        estimatedTimeSeconds,

        requiresTool,

        requiresMeasurement,

        difficulty,
      });

    const costPenalty =
      cost.total *
      0.15;

    const profileBonus =
      profile ===
        "particulier"
        ? (
            action.complexity ===
              "simple"
              ? 0.65
              : -0.5
          )
        : profile ===
            "depanneur"
          ? (
              estimatedTimeSeconds <=
                20
                ? 0.4
                : -0.25
            )
          : 0;

    const finalScore =
        informationGain +
        discriminationScore *
          1.25 +
        evidenceCoverage *
          0.05 +
        priorityBonus +
        profileBonus -
        complexityPenalty -
        costPenalty;

    return {
      action,

      informationGain,

      hypothesisCoverage,

      evidenceCoverage,

      complexityPenalty,

      priorityBonus,

      profileBonus,

      costPenalty,

      finalScore,
    };
  }
}







