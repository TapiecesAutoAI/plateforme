export interface KnowledgeOptimizerActionOption {
  id: string;
  label: string;
  value: string;
  addsEvidence?: string[];
  rejectsEvidence?: string[];
  supportsHypotheses?: string[];
  rejectsHypotheses?: string[];
  nextActionId?: string;
}

export interface KnowledgeOptimizerAction {
  id: string;
  workflowId: string;
  type: string;
  text: string;
  priority: number;
  family?: string;
  diagnosticPower?: number;
  estimatedTimeSeconds?: number;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  requiresTool?: boolean;
  discriminates?: string[];
  stopIfKnown?: boolean;
  requiredEvidence?: string[];
  options?: KnowledgeOptimizerActionOption[];
}

export interface KnowledgeOptimizerPackage {
  domain: string;
  actions: KnowledgeOptimizerAction[];
  evidences: Array<{
    id: string;
  }>;
  hypotheses: Array<{
    id: string;
  }>;
  rules: Array<{
    id: string;
    evidenceId: string;
    hypothesisId: string;
  }>;
  workflow: {
    id: string;
    entryActionId: string;
  };
}

export type KnowledgeIssueSeverity =
  | "error"
  | "warning"
  | "info";

export interface KnowledgeOptimizerIssue {
  severity: KnowledgeIssueSeverity;
  code: string;
  domain: string;
  actionId?: string;
  message: string;
}

export interface KnowledgeOptimizerReport {
  domain: string;
  actionCount: number;
  questionCount: number;
  familyCount: number;
  missingFamilyCount: number;
  missingDiagnosticPowerCount: number;
  missingTimeCount: number;
  missingDifficultyCount: number;
  missingStopIfKnownCount: number;
  duplicateFamilyCount: number;
  brokenReferenceCount: number;
  weakQuestionCount: number;
  qualityScore: number;
  issues: KnowledgeOptimizerIssue[];
}

export interface KnowledgeOptimizerOptions {
  minimumDiagnosticPower: number;
  defaultEstimatedTimeSeconds: number;
  duplicateFamilyWarningThreshold: number;
}

const DEFAULT_OPTIONS: KnowledgeOptimizerOptions = {
  minimumDiagnosticPower: 20,
  defaultEstimatedTimeSeconds: 15,
  duplicateFamilyWarningThreshold: 3,
};

export class KnowledgeOptimizer {
  private readonly options: KnowledgeOptimizerOptions;

  public constructor(
    options: Partial<KnowledgeOptimizerOptions> = {},
  ) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    this.validateOptions(this.options);
  }

  public analyze(
    knowledge: KnowledgeOptimizerPackage,
  ): KnowledgeOptimizerReport {
    const issues: KnowledgeOptimizerIssue[] = [];

    const actionIds = new Set(
      knowledge.actions.map(
        action => action.id,
      ),
    );

    const evidenceIds = new Set(
      knowledge.evidences.map(
        evidence => evidence.id,
      ),
    );

    const hypothesisIds = new Set(
      knowledge.hypotheses.map(
        hypothesis => hypothesis.id,
      ),
    );

    const questionActions =
      knowledge.actions.filter(
        action =>
          action.type === "ask-question" ||
          action.type === "request-observation" ||
          action.type === "request-measurement" ||
          action.type === "recommend-test",
      );

    const familyActions =
      new Map<string, KnowledgeOptimizerAction[]>();

    let missingFamilyCount = 0;
    let missingDiagnosticPowerCount = 0;
    let missingTimeCount = 0;
    let missingDifficultyCount = 0;
    let missingStopIfKnownCount = 0;
    let weakQuestionCount = 0;
    let brokenReferenceCount = 0;

    for (const action of questionActions) {
      const family =
        action.family?.trim() ?? "";

      if (!family) {
        missingFamilyCount++;

        issues.push({
          severity: "warning",
          code: "ACTION_FAMILY_MISSING",
          domain: knowledge.domain,
          actionId: action.id,
          message:
            `La question "${action.id}" ne possède pas de famille.`,
        });
      } else {
        const current =
          familyActions.get(family) ?? [];

        current.push(action);
        familyActions.set(
          family,
          current,
        );
      }

      if (
        !Number.isFinite(
          action.diagnosticPower,
        )
      ) {
        missingDiagnosticPowerCount++;

        issues.push({
          severity: "warning",
          code: "DIAGNOSTIC_POWER_MISSING",
          domain: knowledge.domain,
          actionId: action.id,
          message:
            `La question "${action.id}" ne possède pas de diagnosticPower.`,
        });
      } else if (
        (action.diagnosticPower ?? 0) <
        this.options.minimumDiagnosticPower
      ) {
        weakQuestionCount++;

        issues.push({
          severity: "info",
          code: "DIAGNOSTIC_POWER_LOW",
          domain: knowledge.domain,
          actionId: action.id,
          message:
            `La question "${action.id}" a une puissance diagnostique faible.`,
        });
      }

      if (
        !Number.isFinite(
          action.estimatedTimeSeconds,
        )
      ) {
        missingTimeCount++;

        issues.push({
          severity: "info",
          code: "ESTIMATED_TIME_MISSING",
          domain: knowledge.domain,
          actionId: action.id,
          message:
            `La question "${action.id}" ne possède pas de durée estimée.`,
        });
      }

      if (
        !Number.isInteger(
          action.difficulty,
        )
      ) {
        missingDifficultyCount++;

        issues.push({
          severity: "info",
          code: "DIFFICULTY_MISSING",
          domain: knowledge.domain,
          actionId: action.id,
          message:
            `La question "${action.id}" ne possède pas de niveau de difficulté.`,
        });
      }

      if (
        typeof action.stopIfKnown !==
        "boolean"
      ) {
        missingStopIfKnownCount++;

        issues.push({
          severity: "info",
          code: "STOP_IF_KNOWN_MISSING",
          domain: knowledge.domain,
          actionId: action.id,
          message:
            `La question "${action.id}" ne précise pas stopIfKnown.`,
        });
      }

      for (
        const evidenceId
        of action.requiredEvidence ?? []
      ) {
        if (!evidenceIds.has(evidenceId)) {
          brokenReferenceCount++;

          issues.push({
            severity: "error",
            code: "REQUIRED_EVIDENCE_NOT_FOUND",
            domain: knowledge.domain,
            actionId: action.id,
            message:
              `La preuve requise "${evidenceId}" est introuvable.`,
          });
        }
      }

      for (const option of action.options ?? []) {
        if (
          option.nextActionId &&
          !actionIds.has(
            option.nextActionId,
          )
        ) {
          brokenReferenceCount++;

          issues.push({
            severity: "error",
            code: "NEXT_ACTION_NOT_FOUND",
            domain: knowledge.domain,
            actionId: action.id,
            message:
              `L'action suivante "${option.nextActionId}" est introuvable.`,
          });
        }

        for (
          const evidenceId
          of [
            ...(option.addsEvidence ?? []),
            ...(option.rejectsEvidence ?? []),
          ]
        ) {
          if (!evidenceIds.has(evidenceId)) {
            brokenReferenceCount++;

            issues.push({
              severity: "error",
              code: "OPTION_EVIDENCE_NOT_FOUND",
              domain: knowledge.domain,
              actionId: action.id,
              message:
                `La preuve "${evidenceId}" utilisée par "${option.id}" est introuvable.`,
            });
          }
        }

        for (
          const hypothesisId
          of [
            ...(option.supportsHypotheses ?? []),
            ...(option.rejectsHypotheses ?? []),
          ]
        ) {
          if (
            !hypothesisIds.has(
              hypothesisId,
            )
          ) {
            brokenReferenceCount++;

            issues.push({
              severity: "error",
              code: "OPTION_HYPOTHESIS_NOT_FOUND",
              domain: knowledge.domain,
              actionId: action.id,
              message:
                `L'hypothèse "${hypothesisId}" utilisée par "${option.id}" est introuvable.`,
            });
          }
        }
      }
    }

    let duplicateFamilyCount = 0;

    for (
      const [family, actions]
      of familyActions
    ) {
      if (
        actions.length >=
        this.options
          .duplicateFamilyWarningThreshold
      ) {
        duplicateFamilyCount++;

        issues.push({
          severity: "warning",
          code: "FAMILY_OVERUSED",
          domain: knowledge.domain,
          message:
            `La famille "${family}" contient ${actions.length} questions.`,
        });
      }
    }

    if (
      !actionIds.has(
        knowledge.workflow.entryActionId,
      )
    ) {
      brokenReferenceCount++;

      issues.push({
        severity: "error",
        code: "ENTRY_ACTION_NOT_FOUND",
        domain: knowledge.domain,
        message:
          `L'action d'entrée "${knowledge.workflow.entryActionId}" est introuvable.`,
      });
    }

    for (const rule of knowledge.rules) {
      if (
        !evidenceIds.has(
          rule.evidenceId,
        )
      ) {
        brokenReferenceCount++;

        issues.push({
          severity: "error",
          code: "RULE_EVIDENCE_NOT_FOUND",
          domain: knowledge.domain,
          message:
            `La règle "${rule.id}" référence une preuve inexistante.`,
        });
      }

      if (
        !hypothesisIds.has(
          rule.hypothesisId,
        )
      ) {
        brokenReferenceCount++;

        issues.push({
          severity: "error",
          code: "RULE_HYPOTHESIS_NOT_FOUND",
          domain: knowledge.domain,
          message:
            `La règle "${rule.id}" référence une hypothèse inexistante.`,
        });
      }
    }

    const penalty =
      brokenReferenceCount * 10 +
      missingFamilyCount * 2 +
      missingDiagnosticPowerCount * 2 +
      missingTimeCount * 0.5 +
      missingDifficultyCount * 0.5 +
      missingStopIfKnownCount * 0.5 +
      weakQuestionCount * 1 +
      duplicateFamilyCount * 1;

    const qualityScore =
      Math.max(
        0,
        Math.min(
          100,
          Math.round(
            100 - penalty,
          ),
        ),
      );

    return {
      domain: knowledge.domain,
      actionCount:
        knowledge.actions.length,
      questionCount:
        questionActions.length,
      familyCount:
        familyActions.size,
      missingFamilyCount,
      missingDiagnosticPowerCount,
      missingTimeCount,
      missingDifficultyCount,
      missingStopIfKnownCount,
      duplicateFamilyCount,
      brokenReferenceCount,
      weakQuestionCount,
      qualityScore,
      issues,
    };
  }

  public applyDefaults(
    knowledge: KnowledgeOptimizerPackage,
  ): KnowledgeOptimizerPackage {
    return {
      ...knowledge,

      actions:
        knowledge.actions.map(
          action => {
            if (
              action.type !==
                "ask-question" &&
              action.type !==
                "request-observation" &&
              action.type !==
                "request-measurement" &&
              action.type !==
                "recommend-test"
            ) {
              return {
                ...action,
              };
            }

            return {
              ...action,

              family:
                action.family ??
                action.id,

              diagnosticPower:
                action.diagnosticPower ??
                this.inferDiagnosticPower(
                  action,
                ),

              estimatedTimeSeconds:
                action.estimatedTimeSeconds ??
                this.options
                  .defaultEstimatedTimeSeconds,

              difficulty:
                action.difficulty ??
                this.inferDifficulty(
                  action,
                ),

              requiresTool:
                action.requiresTool ??
                this.inferRequiresTool(
                  action,
                ),

              discriminates:
                action.discriminates ??
                [],

              stopIfKnown:
                action.stopIfKnown ??
                true,
            };
          },
        ),
    };
  }

  private inferDiagnosticPower(
    action: KnowledgeOptimizerAction,
  ): number {
    if (
      action.type ===
      "request-measurement"
    ) {
      return 90;
    }

    if (
      action.type ===
      "request-observation"
    ) {
      return 75;
    }

    if (
      action.type ===
      "recommend-test"
    ) {
      return 70;
    }

    return 60;
  }

  private inferDifficulty(
    action: KnowledgeOptimizerAction,
  ): 1 | 2 | 3 | 4 | 5 {
    if (
      action.type ===
      "request-measurement"
    ) {
      return 4;
    }

    if (
      action.type ===
      "recommend-test"
    ) {
      return 3;
    }

    if (
      action.type ===
      "request-observation"
    ) {
      return 2;
    }

    return 1;
  }

  private inferRequiresTool(
    action: KnowledgeOptimizerAction,
  ): boolean {
    return (
      action.type ===
        "request-measurement" ||
      action.type ===
        "recommend-test"
    );
  }

  private validateOptions(
    options: KnowledgeOptimizerOptions,
  ): void {
    if (
      !Number.isFinite(
        options.minimumDiagnosticPower,
      ) ||
      options.minimumDiagnosticPower < 0 ||
      options.minimumDiagnosticPower > 100
    ) {
      throw new RangeError(
        "minimumDiagnosticPower doit être compris entre 0 et 100.",
      );
    }

    if (
      !Number.isFinite(
        options.defaultEstimatedTimeSeconds,
      ) ||
      options.defaultEstimatedTimeSeconds <= 0
    ) {
      throw new RangeError(
        "defaultEstimatedTimeSeconds doit être strictement positif.",
      );
    }

    if (
      !Number.isInteger(
        options.duplicateFamilyWarningThreshold,
      ) ||
      options.duplicateFamilyWarningThreshold < 2
    ) {
      throw new RangeError(
        "duplicateFamilyWarningThreshold doit être supérieur ou égal à 2.",
      );
    }
  }
}
