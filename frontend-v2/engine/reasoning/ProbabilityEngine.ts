import {
  Evidence,
  Hypothesis,
  ProbabilityResult,
  ReasoningContext,
} from "../model";

type EvidenceState =
  | "confirmed"
  | "rejected"
  | "uncertain"
  | "unknown";

interface EvidenceAssessment {
  state: EvidenceState;
  reliability: number;
  supportContribution: number;
  contradictionContribution: number;
}

interface HypothesisAssessment {
  hypothesis: Hypothesis;
  support: number;
  contradiction: number;
  rawScore: number;
  adjustedScore: number;
  prior: number;
  requiredCoverage: number;
  evidenceCoverage: number;
  isEliminated: boolean;
}

interface ProbabilityEngineOptions {
  minimumPrior: number;
  maximumPrior: number;
  supportWeight: number;
  contradictionWeight: number;
  rejectedSupportPenalty: number;
  rejectedContradictionBonus: number;
  uncertainWeight: number;
  requiredEvidencePenalty: number;
  missingRequiredEvidencePenalty: number;
  eliminationMultiplier: number;
  confidenceWeight: number;
  evidenceCoverageWeight: number;
  scoreFloor: number;
  probabilityPrecision: number;
}

const DEFAULT_OPTIONS: Readonly<ProbabilityEngineOptions> = {
  minimumPrior: 0.01,
  maximumPrior: 1,
  supportWeight: 1.25,
  contradictionWeight: 1.5,
  rejectedSupportPenalty: 0.8,
  rejectedContradictionBonus: 0.65,
  uncertainWeight: 0.35,
  requiredEvidencePenalty: 1.75,
  missingRequiredEvidencePenalty: 0.25,
  eliminationMultiplier: 0,
  confidenceWeight: 0.35,
  evidenceCoverageWeight: 0.2,
  scoreFloor: 0.000001,
  probabilityPrecision: 12,
};

export class ProbabilityEngine {
  private readonly options: Readonly<ProbabilityEngineOptions>;

  public constructor(
    options: Partial<ProbabilityEngineOptions> = {},
  ) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }

  public compute(
    context: ReasoningContext,
  ): ProbabilityResult[] {
    const assessments = Array.from(
      context.hypotheses.values(),
      (hypothesis) =>
        this.assessHypothesis(
          hypothesis,
          context,
        ),
    );

    const normalized =
      this.normalizeAssessments(assessments);

    return normalized
      .map((assessment) => ({
        hypothesis: assessment.hypothesis,
        support: this.roundMetric(
          assessment.support,
        ),
        contradiction: this.roundMetric(
          assessment.contradiction,
        ),
        score: this.roundMetric(
          assessment.adjustedScore,
        ),
        probability: this.roundProbability(
          assessment.probability,
        ),
      }))
      .sort((first, second) =>
        this.compareResults(first, second),
      );
  }

  private assessHypothesis(
    hypothesis: Hypothesis,
    context: ReasoningContext,
  ): HypothesisAssessment {
    const prior = this.computePrior(hypothesis);

    const supportAssessment =
      this.assessEvidenceCollection(
        hypothesis.supportingEvidenceIds,
        context,
        "support",
        hypothesis.supportingEvidenceWeights,
      );

    const contradictionAssessment =
      this.assessEvidenceCollection(
        hypothesis.contradictingEvidenceIds,
        context,
        "contradiction",
        hypothesis.contradictingEvidenceWeights,
      );

    const requiredCoverage =
      this.computeRequiredEvidenceCoverage(
        hypothesis,
        context,
      );

    const evidenceCoverage =
      this.computeEvidenceCoverage(
        hypothesis,
        context,
      );

    const requiredPenalty =
      this.computeRequiredEvidencePenalty(
        hypothesis,
        context,
      );

    const confidenceFactor =
      this.computeConfidenceFactor(
        hypothesis.confidence,
      );

    const coverageFactor =
      this.computeCoverageFactor(
        evidenceCoverage,
      );

    const rawScore =
      prior +
      supportAssessment.supportContribution -
      contradictionAssessment.contradictionContribution -
      requiredPenalty;

    const isEliminated =
      context.eliminatedHypothesisIds.has(
        hypothesis.id,
      );

    const activeFactor =
      this.computeActivityFactor(
        hypothesis,
        context,
      );

    const adjustedScore = this.sanitizeScore(
      rawScore *
        confidenceFactor *
        coverageFactor *
        activeFactor *
        (isEliminated
          ? this.options.eliminationMultiplier
          : 1),
    );

    return {
      hypothesis,
      support:
        supportAssessment.supportContribution,
      contradiction:
        contradictionAssessment
          .contradictionContribution,
      rawScore,
      adjustedScore,
      prior,
      requiredCoverage,
      evidenceCoverage,
      isEliminated,
    };
  }

  private assessEvidenceCollection(
    evidenceIds: readonly string[],
    context: ReasoningContext,
    relation: "support" | "contradiction",
    evidenceWeights:
      Readonly<Record<string, number>> = {},
  ): EvidenceAssessment {
    let reliability = 0;
    let supportContribution = 0;
    let contradictionContribution = 0;
    let dominantState: EvidenceState = "unknown";

    for (const evidenceId of evidenceIds) {
      const evidence = context.evidences.get(
        evidenceId,
      );

      const assessment = this.assessEvidence(
        evidenceId,
        evidence,
        context,
        relation,
        evidenceWeights[evidenceId] ?? 1,
      );

      reliability += assessment.reliability;
      supportContribution +=
        assessment.supportContribution;
      contradictionContribution +=
        assessment.contradictionContribution;

      dominantState = this.selectDominantState(
        dominantState,
        assessment.state,
      );
    }

    return {
      state: dominantState,
      reliability,
      supportContribution,
      contradictionContribution,
    };
  }

  private assessEvidence(
    evidenceId: string,
    evidence: Evidence | undefined,
    context: ReasoningContext,
    relation: "support" | "contradiction",
    ruleWeight: number,
  ): EvidenceAssessment {
    const state = this.resolveEvidenceState(
      evidenceId,
      evidence,
      context,
    );

    const reliability = this.clamp01(
      evidence?.reliability ?? 0.5,
    );

    if (relation === "support") {
      return this.assessSupportingEvidence(
        state,
        reliability,
        ruleWeight,
      );
    }

    return this.assessContradictingEvidence(
      state,
      reliability,
      ruleWeight,
    );
  }

  private assessSupportingEvidence(
    state: EvidenceState,
    reliability: number,
    ruleWeight: number,
  ): EvidenceAssessment {
    let supportContribution = 0;
    let contradictionContribution = 0;

    switch (state) {
      case "confirmed":
        supportContribution =
          reliability *
          this.clamp01(ruleWeight) *
          this.options.supportWeight;
        break;

      case "rejected":
        contradictionContribution =
          reliability *
          this.clamp01(ruleWeight) *
          this.options.rejectedSupportPenalty;
        break;

      case "uncertain":
        supportContribution =
          reliability *
          this.clamp01(ruleWeight) *
          this.options.supportWeight *
          this.options.uncertainWeight;
        break;

      case "unknown":
        break;
    }

    return {
      state,
      reliability,
      supportContribution,
      contradictionContribution,
    };
  }

  private assessContradictingEvidence(
    state: EvidenceState,
    reliability: number,
    ruleWeight: number,
  ): EvidenceAssessment {
    let supportContribution = 0;
    let contradictionContribution = 0;

    switch (state) {
      case "confirmed":
        contradictionContribution =
          reliability *
          this.clamp01(ruleWeight) *
          this.options.contradictionWeight;
        break;

      case "rejected":
        supportContribution =
          reliability *
          this.clamp01(ruleWeight) *
          this.options.rejectedContradictionBonus;
        break;

      case "uncertain":
        contradictionContribution =
          reliability *
          this.clamp01(ruleWeight) *
          this.options.contradictionWeight *
          this.options.uncertainWeight;
        break;

      case "unknown":
        break;
    }

    return {
      state,
      reliability,
      supportContribution,
      contradictionContribution,
    };
  }

  private resolveEvidenceState(
    evidenceId: string,
    evidence: Evidence | undefined,
    context: ReasoningContext,
  ): EvidenceState {
    if (
      context.confirmedEvidenceIds.has(evidenceId)
    ) {
      return "confirmed";
    }

    if (
      context.rejectedEvidenceIds.has(evidenceId)
    ) {
      return "rejected";
    }

    return evidence?.status ?? "unknown";
  }

  private computePrior(
    hypothesis: Hypothesis,
  ): number {
    const baseScore = this.clamp(
      this.toFiniteNumber(hypothesis.baseScore),
      this.options.minimumPrior,
      this.options.maximumPrior,
    );

    const confidence = this.clamp01(
      this.toFiniteNumber(hypothesis.confidence),
    );

    return this.clamp(
      baseScore * (0.5 + confidence * 0.5),
      this.options.minimumPrior,
      this.options.maximumPrior,
    );
  }

  private computeRequiredEvidenceCoverage(
    hypothesis: Hypothesis,
    context: ReasoningContext,
  ): number {
    if (hypothesis.requiredEvidenceIds.length === 0) {
      return 1;
    }

    let confirmed = 0;

    for (const evidenceId of
      hypothesis.requiredEvidenceIds) {
      if (
        this.resolveEvidenceState(
          evidenceId,
          context.evidences.get(evidenceId),
          context,
        ) === "confirmed"
      ) {
        confirmed += 1;
      }
    }

    return confirmed /
      hypothesis.requiredEvidenceIds.length;
  }

  private computeRequiredEvidencePenalty(
    hypothesis: Hypothesis,
    context: ReasoningContext,
  ): number {
    let penalty = 0;

    for (const evidenceId of
      hypothesis.requiredEvidenceIds) {
      const evidence = context.evidences.get(
        evidenceId,
      );

      const state = this.resolveEvidenceState(
        evidenceId,
        evidence,
        context,
      );

      const reliability = this.clamp01(
        evidence?.reliability ?? 0.5,
      );

      if (state === "rejected") {
        penalty +=
          this.options.requiredEvidencePenalty *
          reliability;
      } else if (state === "unknown") {
        penalty +=
          this.options
            .missingRequiredEvidencePenalty;
      } else if (state === "uncertain") {
        penalty +=
          this.options
            .missingRequiredEvidencePenalty *
          0.5;
      }
    }

    return penalty;
  }

  private computeEvidenceCoverage(
    hypothesis: Hypothesis,
    context: ReasoningContext,
  ): number {
    const evidenceIds = new Set<string>([
      ...hypothesis.supportingEvidenceIds,
      ...hypothesis.contradictingEvidenceIds,
      ...hypothesis.requiredEvidenceIds,
    ]);

    if (evidenceIds.size === 0) {
      return 1;
    }

    let resolved = 0;

    for (const evidenceId of evidenceIds) {
      const state = this.resolveEvidenceState(
        evidenceId,
        context.evidences.get(evidenceId),
        context,
      );

      if (
        state === "confirmed" ||
        state === "rejected"
      ) {
        resolved += 1;
      } else if (state === "uncertain") {
        resolved += this.options.uncertainWeight;
      }
    }

    return resolved / evidenceIds.size;
  }

  private computeConfidenceFactor(
    confidence: number,
  ): number {
    const normalized = this.clamp01(
      this.toFiniteNumber(confidence),
    );

    return 1 -
      this.options.confidenceWeight +
      normalized *
        this.options.confidenceWeight;
  }

  private computeCoverageFactor(
    evidenceCoverage: number,
  ): number {
    return 1 -
      this.options.evidenceCoverageWeight +
      this.clamp01(evidenceCoverage) *
        this.options.evidenceCoverageWeight;
  }

  private computeActivityFactor(
    hypothesis: Hypothesis,
    context: ReasoningContext,
  ): number {
    if (
      context.activeHypothesisIds.size === 0
    ) {
      return 1;
    }

    return context.activeHypothesisIds.has(
      hypothesis.id,
    )
      ? 1
      : 0.5;
  }

  private normalizeAssessments(
    assessments: readonly HypothesisAssessment[],
  ): Array<
    HypothesisAssessment & {
      probability: number;
    }
  > {
    const candidates =
      assessments.filter(
        assessment =>
          !assessment.isEliminated &&
          assessment.adjustedScore >
            0,
      );

    if (
      candidates.length ===
      0
    ) {
      return assessments.map(
        assessment => ({
          ...assessment,

          probability:
            0,
        }),
      );
    }

    const temperature =
      0.12;

    const maximumScore =
      Math.max(
        ...candidates.map(
          assessment =>
            assessment.adjustedScore,
        ),
      );

    const exponentials =
      new Map<string, number>();

    let exponentialTotal =
      0;

    for (
      const assessment
      of candidates
    ) {
      const centeredScore =
        assessment.adjustedScore -
        maximumScore;

      const exponential =
        Math.exp(
          centeredScore /
          temperature,
        );

      exponentials.set(
        assessment.hypothesis.id,
        exponential,
      );

      exponentialTotal +=
        exponential;
    }

    if (
      !Number.isFinite(
        exponentialTotal,
      ) ||
      exponentialTotal <=
        0
    ) {
      const fallbackProbability =
        1 /
        candidates.length;

      return assessments.map(
        assessment => ({
          ...assessment,

          probability:
            assessment.isEliminated
              ? 0
              : fallbackProbability,
        }),
      );
    }

    return assessments.map(
      assessment => ({
        ...assessment,

        probability:
          assessment.isEliminated
            ? 0
            : (
                exponentials.get(
                  assessment
                    .hypothesis
                    .id,
                ) ??
                0
              ) /
              exponentialTotal,
      }),
    );
  }

  private compareResults(
    first: ProbabilityResult,
    second: ProbabilityResult,
  ): number {
    if (
      second.probability !== first.probability
    ) {
      return second.probability -
        first.probability;
    }

    if (second.score !== first.score) {
      return second.score - first.score;
    }

    if (second.support !== first.support) {
      return second.support - first.support;
    }

    if (
      first.contradiction !== second.contradiction
    ) {
      return first.contradiction -
        second.contradiction;
    }

    return first.hypothesis.id.localeCompare(
      second.hypothesis.id,
    );
  }

  private selectDominantState(
    current: EvidenceState,
    candidate: EvidenceState,
  ): EvidenceState {
    const priority: Record<EvidenceState, number> = {
      unknown: 0,
      uncertain: 1,
      rejected: 2,
      confirmed: 3,
    };

    return priority[candidate] > priority[current]
      ? candidate
      : current;
  }

  private sanitizeScore(score: number): number {
    if (!Number.isFinite(score) || score <= 0) {
      return 0;
    }

    return Math.max(
      this.options.scoreFloor,
      score,
    );
  }

  private toFiniteNumber(value: number): number {
    return Number.isFinite(value) ? value : 0;
  }

  private clamp01(value: number): number {
    return this.clamp(value, 0, 1);
  }

  private clamp(
    value: number,
    minimum: number,
    maximum: number,
  ): number {
    return Math.min(
      maximum,
      Math.max(minimum, value),
    );
  }

  private roundMetric(value: number): number {
    return Number(value.toFixed(6));
  }

  private roundProbability(
    value: number,
  ): number {
    return Number(
      value.toFixed(
        this.options.probabilityPrecision,
      ),
    );
  }
}

