import type {
  KnowledgeOptimizerAction,
  KnowledgeOptimizerIssue,
  KnowledgeOptimizerPackage,
  KnowledgeOptimizerReport,
} from "./KnowledgeOptimizer";

export type KnowledgeEvolutionPriority =
  | "critical"
  | "high"
  | "medium"
  | "low";

export type KnowledgeEvolutionType =
  | "fix-reference"
  | "add-family"
  | "add-metadata"
  | "merge-questions"
  | "increase-diagnostic-power"
  | "reduce-question-cost"
  | "reorder-question"
  | "add-discrimination"
  | "review-question";

export interface KnowledgeEvolutionSuggestion {
  id: string;
  domain: string;
  actionId?: string;
  relatedActionIds?: string[];
  type: KnowledgeEvolutionType;
  priority: KnowledgeEvolutionPriority;
  title: string;
  description: string;
  estimatedQualityGain: number;
  estimatedQuestionReduction: number;
  estimatedTimeSavingSeconds: number;
  automatic: boolean;
}

export interface KnowledgeEvolutionMetrics {
  averageQuestionTimeSeconds: number;
  averageDiagnosticPower: number;
  averageQuestionDifficulty: number;
  toolRequiredRatio: number;
  questionMetadataCoverage: number;
  estimatedParticulierQuestionCount: number;
  estimatedParticulierDurationSeconds: number;
  diagnosticRoiScore: number;
}

export interface KnowledgeEvolutionReport {
  domain: string;
  currentQualityScore: number;
  projectedQualityScore: number;
  metrics: KnowledgeEvolutionMetrics;
  suggestions: KnowledgeEvolutionSuggestion[];
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export interface KnowledgeEvolutionEngineOptions {
  particulierMaximumQuestions: number;
  particulierMaximumDurationSeconds: number;
  lowDiagnosticPowerThreshold: number;
  highDifficultyThreshold: number;
  lowRoiThreshold: number;
  similarityThreshold: number;
  maximumSuggestions: number;
}

const DEFAULT_OPTIONS: KnowledgeEvolutionEngineOptions = {
  particulierMaximumQuestions: 6,
  particulierMaximumDurationSeconds: 90,
  lowDiagnosticPowerThreshold: 35,
  highDifficultyThreshold: 4,
  lowRoiThreshold: 2,
  similarityThreshold: 0.72,
  maximumSuggestions: 100,
};

export class KnowledgeEvolutionEngine {
  private readonly options: KnowledgeEvolutionEngineOptions;

  public constructor(
    options: Partial<KnowledgeEvolutionEngineOptions> = {},
  ) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    this.validateOptions(this.options);
  }

  public analyze(
    knowledge: KnowledgeOptimizerPackage,
    optimizerReport: KnowledgeOptimizerReport,
  ): KnowledgeEvolutionReport {
    const questionActions =
      knowledge.actions.filter(
        action => this.isQuestionAction(action),
      );

    const suggestions: KnowledgeEvolutionSuggestion[] = [];

    for (const issue of optimizerReport.issues) {
      const suggestion =
        this.convertOptimizerIssue(
          knowledge.domain,
          issue,
        );

      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    suggestions.push(
      ...this.findQuestionDuplicates(
        knowledge.domain,
        questionActions,
      ),
    );

    suggestions.push(
      ...this.findLowRoiQuestions(
        knowledge.domain,
        questionActions,
      ),
    );

    suggestions.push(
      ...this.findMissingDiscrimination(
        knowledge.domain,
        questionActions,
      ),
    );

    suggestions.push(
      ...this.findPoorOrdering(
        knowledge.domain,
        questionActions,
      ),
    );

    const uniqueSuggestions =
      this.uniqueSuggestions(
        suggestions,
      )
        .sort(
          (left, right) =>
            this.priorityValue(
              right.priority,
            ) -
              this.priorityValue(
                left.priority,
              ) ||
            right.estimatedQualityGain -
              left.estimatedQualityGain,
        )
        .slice(
          0,
          this.options.maximumSuggestions,
        );

    const metrics =
      this.calculateMetrics(
        questionActions,
      );

    const projectedQualityGain =
      uniqueSuggestions.reduce(
        (total, suggestion) =>
          total +
          suggestion.estimatedQualityGain,
        0,
      );

    const projectedQualityScore =
      Math.min(
        100,
        Math.round(
          optimizerReport.qualityScore +
          projectedQualityGain,
        ),
      );

    return {
      domain: knowledge.domain,
      currentQualityScore:
        optimizerReport.qualityScore,
      projectedQualityScore,
      metrics,
      suggestions: uniqueSuggestions,
      criticalCount:
        uniqueSuggestions.filter(
          suggestion =>
            suggestion.priority ===
            "critical",
        ).length,
      highCount:
        uniqueSuggestions.filter(
          suggestion =>
            suggestion.priority ===
            "high",
        ).length,
      mediumCount:
        uniqueSuggestions.filter(
          suggestion =>
            suggestion.priority ===
            "medium",
        ).length,
      lowCount:
        uniqueSuggestions.filter(
          suggestion =>
            suggestion.priority ===
            "low",
        ).length,
    };
  }

  private convertOptimizerIssue(
    domain: string,
    issue: KnowledgeOptimizerIssue,
  ): KnowledgeEvolutionSuggestion | null {
    switch (issue.code) {
      case "NEXT_ACTION_NOT_FOUND":
      case "REQUIRED_EVIDENCE_NOT_FOUND":
      case "OPTION_EVIDENCE_NOT_FOUND":
      case "OPTION_HYPOTHESIS_NOT_FOUND":
      case "ENTRY_ACTION_NOT_FOUND":
      case "RULE_EVIDENCE_NOT_FOUND":
      case "RULE_HYPOTHESIS_NOT_FOUND":
        return {
          id:
            `fix-${domain}-${issue.code}-${issue.actionId ?? "domain"}`,
          domain,
          actionId: issue.actionId,
          type: "fix-reference",
          priority: "critical",
          title: "Corriger une référence cassée",
          description: issue.message,
          estimatedQualityGain: 10,
          estimatedQuestionReduction: 0,
          estimatedTimeSavingSeconds: 0,
          automatic: false,
        };

      case "ACTION_FAMILY_MISSING":
        return {
          id:
            `family-${domain}-${issue.actionId ?? "unknown"}`,
          domain,
          actionId: issue.actionId,
          type: "add-family",
          priority: "high",
          title: "Ajouter une famille de question",
          description:
            "Cette question doit recevoir une famille stable afin d'éviter les répétitions.",
          estimatedQualityGain: 2,
          estimatedQuestionReduction: 1,
          estimatedTimeSavingSeconds: 12,
          automatic: true,
        };

      case "DIAGNOSTIC_POWER_MISSING":
      case "ESTIMATED_TIME_MISSING":
      case "DIFFICULTY_MISSING":
      case "STOP_IF_KNOWN_MISSING":
        return {
          id:
            `metadata-${domain}-${issue.code}-${issue.actionId ?? "unknown"}`,
          domain,
          actionId: issue.actionId,
          type: "add-metadata",
          priority: "medium",
          title: "Compléter les métadonnées",
          description: issue.message,
          estimatedQualityGain: 1,
          estimatedQuestionReduction: 0,
          estimatedTimeSavingSeconds: 0,
          automatic: true,
        };

      case "DIAGNOSTIC_POWER_LOW":
        return {
          id:
            `power-${domain}-${issue.actionId ?? "unknown"}`,
          domain,
          actionId: issue.actionId,
          type: "review-question",
          priority: "low",
          title: "Réévaluer une question faible",
          description:
            "Cette question apporte probablement trop peu d'information pour être posée tôt.",
          estimatedQualityGain: 1,
          estimatedQuestionReduction: 1,
          estimatedTimeSavingSeconds: 10,
          automatic: false,
        };

      case "FAMILY_OVERUSED":
        return {
          id:
            `family-overused-${domain}-${this.slug(issue.message)}`,
          domain,
          type: "merge-questions",
          priority: "high",
          title: "Réduire une famille trop chargée",
          description: issue.message,
          estimatedQualityGain: 2,
          estimatedQuestionReduction: 2,
          estimatedTimeSavingSeconds: 20,
          automatic: false,
        };

      default:
        return null;
    }
  }

  private findQuestionDuplicates(
    domain: string,
    actions: KnowledgeOptimizerAction[],
  ): KnowledgeEvolutionSuggestion[] {
    const suggestions: KnowledgeEvolutionSuggestion[] = [];

    for (
      let leftIndex = 0;
      leftIndex < actions.length;
      leftIndex++
    ) {
      for (
        let rightIndex =
          leftIndex + 1;
        rightIndex < actions.length;
        rightIndex++
      ) {
        const left =
          actions[leftIndex];

        const right =
          actions[rightIndex];

        if (
          left.family &&
          right.family &&
          left.family !== right.family
        ) {
          continue;
        }

        const similarity =
          this.textSimilarity(
            left.text,
            right.text,
          );

        const sameEvidenceTargets =
          this.evidenceTargetSimilarity(
            left,
            right,
          );

        const combinedScore =
          similarity * 0.6 +
          sameEvidenceTargets * 0.4;

        if (
          combinedScore <
          this.options.similarityThreshold
        ) {
          continue;
        }

        suggestions.push({
          id:
            `merge-${domain}-${left.id}-${right.id}`,
          domain,
          actionId: left.id,
          relatedActionIds: [
            right.id,
          ],
          type: "merge-questions",
          priority: "high",
          title: "Fusionner deux questions proches",
          description:
            `"${left.id}" et "${right.id}" semblent demander la même information.`,
          estimatedQualityGain: 2,
          estimatedQuestionReduction: 1,
          estimatedTimeSavingSeconds:
            Math.min(
              this.getEstimatedTime(left),
              this.getEstimatedTime(right),
            ),
          automatic: false,
        });
      }
    }

    return suggestions;
  }

  private findLowRoiQuestions(
    domain: string,
    actions: KnowledgeOptimizerAction[],
  ): KnowledgeEvolutionSuggestion[] {
    const suggestions: KnowledgeEvolutionSuggestion[] = [];

    for (const action of actions) {
      const power =
        this.getDiagnosticPower(action);

      const time =
        this.getEstimatedTime(action);

      const difficulty =
        action.difficulty ?? 1;

      const toolPenalty =
        action.requiresTool
          ? 1.5
          : 1;

      const roi =
        power /
        Math.max(
          1,
          time *
          difficulty *
          toolPenalty,
        );

      if (
        roi >=
        this.options.lowRoiThreshold
      ) {
        continue;
      }

      suggestions.push({
        id:
          `roi-${domain}-${action.id}`,
        domain,
        actionId: action.id,
        type: "reduce-question-cost",
        priority:
          difficulty >=
            this.options.highDifficultyThreshold
            ? "high"
            : "medium",
        title: "Réduire le coût de la question",
        description:
          `La question "${action.id}" a un rendement diagnostique faible par rapport au temps et à la difficulté demandés.`,
        estimatedQualityGain: 1,
        estimatedQuestionReduction: 1,
        estimatedTimeSavingSeconds: time,
        automatic: false,
      });
    }

    return suggestions;
  }

  private findMissingDiscrimination(
    domain: string,
    actions: KnowledgeOptimizerAction[],
  ): KnowledgeEvolutionSuggestion[] {
    return actions
      .filter(
        action =>
          !action.discriminates ||
          action.discriminates.length <
            2,
      )
      .filter(
        action =>
          this.getDiagnosticPower(action) >=
          70,
      )
      .map(
        action => ({
          id:
            `discrimination-${domain}-${action.id}`,
          domain,
          actionId: action.id,
          type: "add-discrimination" as const,
          priority: "medium" as const,
          title:
            "Déclarer les hypothèses départagées",
          description:
            `La question "${action.id}" est puissante mais ne précise pas les hypothèses qu'elle permet de différencier.`,
          estimatedQualityGain: 1,
          estimatedQuestionReduction: 0,
          estimatedTimeSavingSeconds: 0,
          automatic: false,
        }),
      );
  }

  private findPoorOrdering(
    domain: string,
    actions: KnowledgeOptimizerAction[],
  ): KnowledgeEvolutionSuggestion[] {
    const suggestions: KnowledgeEvolutionSuggestion[] = [];

    const sortedByPriority =
      [...actions].sort(
        (left, right) =>
          left.priority -
          right.priority,
      );

    for (
      let index = 0;
      index <
      sortedByPriority.length - 1;
      index++
    ) {
      const current =
        sortedByPriority[index];

      const next =
        sortedByPriority[index + 1];

      const currentPower =
        this.getDiagnosticPower(
          current,
        );

      const nextPower =
        this.getDiagnosticPower(
          next,
        );

      const currentCost =
        this.getQuestionCost(
          current,
        );

      const nextCost =
        this.getQuestionCost(
          next,
        );

      if (
        nextPower -
          currentPower <
          25
      ) {
        continue;
      }

      if (
        nextCost >
        currentCost
      ) {
        continue;
      }

      suggestions.push({
        id:
          `order-${domain}-${current.id}-${next.id}`,
        domain,
        actionId: current.id,
        relatedActionIds: [
          next.id,
        ],
        type: "reorder-question",
        priority: "medium",
        title: "Poser une question plus utile plus tôt",
        description:
          `"${next.id}" semble plus discriminante et moins coûteuse que "${current.id}".`,
        estimatedQualityGain: 1,
        estimatedQuestionReduction: 0,
        estimatedTimeSavingSeconds:
          Math.max(
            0,
            this.getEstimatedTime(
              current,
            ) -
            this.getEstimatedTime(
              next,
            ),
          ),
        automatic: false,
      });
    }

    return suggestions;
  }

  private calculateMetrics(
    actions: KnowledgeOptimizerAction[],
  ): KnowledgeEvolutionMetrics {
    if (actions.length === 0) {
      return {
        averageQuestionTimeSeconds: 0,
        averageDiagnosticPower: 0,
        averageQuestionDifficulty: 0,
        toolRequiredRatio: 0,
        questionMetadataCoverage: 0,
        estimatedParticulierQuestionCount: 0,
        estimatedParticulierDurationSeconds: 0,
        diagnosticRoiScore: 0,
      };
    }

    const totalTime =
      actions.reduce(
        (total, action) =>
          total +
          this.getEstimatedTime(
            action,
          ),
        0,
      );

    const totalPower =
      actions.reduce(
        (total, action) =>
          total +
          this.getDiagnosticPower(
            action,
          ),
        0,
      );

    const totalDifficulty =
      actions.reduce(
        (total, action) =>
          total +
          (action.difficulty ?? 1),
        0,
      );

    const toolRequiredCount =
      actions.filter(
        action =>
          action.requiresTool === true,
      ).length;

    const metadataFieldCount =
      actions.length * 7;

    const completedMetadataFields =
      actions.reduce(
        (total, action) =>
          total +
          Number(
            Boolean(
              action.family,
            ),
          ) +
          Number(
            Number.isFinite(
              action.diagnosticPower,
            ),
          ) +
          Number(
            Number.isFinite(
              action.estimatedTimeSeconds,
            ),
          ) +
          Number(
            Number.isInteger(
              action.difficulty,
            ),
          ) +
          Number(
            typeof action.requiresTool ===
              "boolean",
          ) +
          Number(
            Array.isArray(
              action.discriminates,
            ),
          ) +
          Number(
            typeof action.stopIfKnown ===
              "boolean",
          ),
        0,
      );

    const particulierActions =
      [...actions]
        .filter(
          action =>
            action.requiresTool !==
              true &&
            (action.difficulty ?? 1) <=
              2,
        )
        .sort(
          (left, right) =>
            this.getQuestionRoi(
              right,
            ) -
            this.getQuestionRoi(
              left,
            ),
        )
        .slice(
          0,
          this.options
            .particulierMaximumQuestions,
        );

    const particulierDuration =
      particulierActions.reduce(
        (total, action) =>
          total +
          this.getEstimatedTime(
            action,
          ),
        0,
      );

    const roi =
      actions.reduce(
        (total, action) =>
          total +
          this.getQuestionRoi(
            action,
          ),
        0,
      ) /
      actions.length;

    return {
      averageQuestionTimeSeconds:
        Math.round(
          totalTime /
          actions.length,
        ),
      averageDiagnosticPower:
        Math.round(
          totalPower /
          actions.length,
        ),
      averageQuestionDifficulty:
        Number(
          (
            totalDifficulty /
            actions.length
          ).toFixed(2),
        ),
      toolRequiredRatio:
        Number(
          (
            toolRequiredCount /
            actions.length
          ).toFixed(3),
        ),
      questionMetadataCoverage:
        Number(
          (
            completedMetadataFields /
            metadataFieldCount
          ).toFixed(3),
        ),
      estimatedParticulierQuestionCount:
        particulierActions.length,
      estimatedParticulierDurationSeconds:
        Math.min(
          this.options
            .particulierMaximumDurationSeconds,
          particulierDuration,
        ),
      diagnosticRoiScore:
        Number(
          roi.toFixed(2),
        ),
    };
  }

  private getQuestionRoi(
    action: KnowledgeOptimizerAction,
  ): number {
    const difficulty =
      action.difficulty ?? 1;

    const toolPenalty =
      action.requiresTool
        ? 1.5
        : 1;

    return (
      this.getDiagnosticPower(action) /
      Math.max(
        1,
        this.getEstimatedTime(action) *
        difficulty *
        toolPenalty,
      )
    );
  }

  private getQuestionCost(
    action: KnowledgeOptimizerAction,
  ): number {
    return (
      this.getEstimatedTime(action) *
      (action.difficulty ?? 1) *
      (
        action.requiresTool
          ? 1.5
          : 1
      )
    );
  }

  private getDiagnosticPower(
    action: KnowledgeOptimizerAction,
  ): number {
    return Math.min(
      100,
      Math.max(
        0,
        action.diagnosticPower ??
        this.inferDiagnosticPower(
          action,
        ),
      ),
    );
  }

  private getEstimatedTime(
    action: KnowledgeOptimizerAction,
  ): number {
    return Math.max(
      1,
      action.estimatedTimeSeconds ??
      this.inferEstimatedTime(
        action,
      ),
    );
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

  private inferEstimatedTime(
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
      "recommend-test"
    ) {
      return 60;
    }

    if (
      action.type ===
      "request-observation"
    ) {
      return 20;
    }

    return 10;
  }

  private evidenceTargetSimilarity(
    left: KnowledgeOptimizerAction,
    right: KnowledgeOptimizerAction,
  ): number {
    const leftIds =
      this.collectActionEvidenceIds(
        left,
      );

    const rightIds =
      this.collectActionEvidenceIds(
        right,
      );

    if (
      leftIds.size === 0 ||
      rightIds.size === 0
    ) {
      return 0;
    }

    const intersection =
      [...leftIds].filter(
        id =>
          rightIds.has(id),
      ).length;

    const union =
      new Set([
        ...leftIds,
        ...rightIds,
      ]).size;

    return union === 0
      ? 0
      : intersection / union;
  }

  private collectActionEvidenceIds(
    action: KnowledgeOptimizerAction,
  ): Set<string> {
    const ids =
      new Set<string>();

    for (
      const evidenceId
      of action.requiredEvidence ?? []
    ) {
      ids.add(evidenceId);
    }

    for (
      const option
      of action.options ?? []
    ) {
      for (
        const evidenceId
        of option.addsEvidence ?? []
      ) {
        ids.add(evidenceId);
      }

      for (
        const evidenceId
        of option.rejectsEvidence ?? []
      ) {
        ids.add(evidenceId);
      }
    }

    return ids;
  }

  private textSimilarity(
    left: string,
    right: string,
  ): number {
    const leftTokens =
      this.tokenize(left);

    const rightTokens =
      this.tokenize(right);

    if (
      leftTokens.size === 0 ||
      rightTokens.size === 0
    ) {
      return 0;
    }

    const intersection =
      [...leftTokens].filter(
        token =>
          rightTokens.has(token),
      ).length;

    const union =
      new Set([
        ...leftTokens,
        ...rightTokens,
      ]).size;

    return union === 0
      ? 0
      : intersection / union;
  }

  private tokenize(
    value: string,
  ): Set<string> {
    return new Set(
      value
        .toLowerCase()
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          "",
        )
        .replace(
          /[^a-z0-9 ]/g,
          " ",
        )
        .split(/\s+/)
        .filter(
          token =>
            token.length >= 3,
        ),
    );
  }

  private uniqueSuggestions(
    suggestions: KnowledgeEvolutionSuggestion[],
  ): KnowledgeEvolutionSuggestion[] {
    const byId =
      new Map<
        string,
        KnowledgeEvolutionSuggestion
      >();

    for (const suggestion of suggestions) {
      if (
        !byId.has(
          suggestion.id,
        )
      ) {
        byId.set(
          suggestion.id,
          suggestion,
        );
      }
    }

    return [
      ...byId.values(),
    ];
  }

  private priorityValue(
    priority: KnowledgeEvolutionPriority,
  ): number {
    switch (priority) {
      case "critical":
        return 4;

      case "high":
        return 3;

      case "medium":
        return 2;

      case "low":
        return 1;
    }
  }

  private slug(
    value: string,
  ): string {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .replace(
        /[^a-z0-9]+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "")
      .slice(
        0,
        80,
      );
  }

  private isQuestionAction(
    action: KnowledgeOptimizerAction,
  ): boolean {
    return (
      action.type ===
        "ask-question" ||
      action.type ===
        "request-observation" ||
      action.type ===
        "request-measurement" ||
      action.type ===
        "recommend-test"
    );
  }

  private validateOptions(
    options: KnowledgeEvolutionEngineOptions,
  ): void {
    if (
      !Number.isInteger(
        options.particulierMaximumQuestions,
      ) ||
      options.particulierMaximumQuestions <
        1
    ) {
      throw new RangeError(
        "particulierMaximumQuestions doit être supérieur ou égal à 1.",
      );
    }

    if (
      !Number.isFinite(
        options.particulierMaximumDurationSeconds,
      ) ||
      options.particulierMaximumDurationSeconds <=
        0
    ) {
      throw new RangeError(
        "particulierMaximumDurationSeconds doit être strictement positif.",
      );
    }

    if (
      !Number.isFinite(
        options.lowDiagnosticPowerThreshold,
      ) ||
      options.lowDiagnosticPowerThreshold <
        0 ||
      options.lowDiagnosticPowerThreshold >
        100
    ) {
      throw new RangeError(
        "lowDiagnosticPowerThreshold doit être compris entre 0 et 100.",
      );
    }

    if (
      !Number.isInteger(
        options.highDifficultyThreshold,
      ) ||
      options.highDifficultyThreshold <
        1 ||
      options.highDifficultyThreshold >
        5
    ) {
      throw new RangeError(
        "highDifficultyThreshold doit être compris entre 1 et 5.",
      );
    }

    if (
      !Number.isFinite(
        options.lowRoiThreshold,
      ) ||
      options.lowRoiThreshold <=
        0
    ) {
      throw new RangeError(
        "lowRoiThreshold doit être strictement positif.",
      );
    }

    if (
      !Number.isFinite(
        options.similarityThreshold,
      ) ||
      options.similarityThreshold <
        0 ||
      options.similarityThreshold >
        1
    ) {
      throw new RangeError(
        "similarityThreshold doit être compris entre 0 et 1.",
      );
    }

    if (
      !Number.isInteger(
        options.maximumSuggestions,
      ) ||
      options.maximumSuggestions <
        1
    ) {
      throw new RangeError(
        "maximumSuggestions doit être supérieur ou égal à 1.",
      );
    }
  }
}
