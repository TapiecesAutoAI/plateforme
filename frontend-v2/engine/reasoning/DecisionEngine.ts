import {
  Contradiction,
  DiagnosticResult,
  Hypothesis,
  InformationGain,
  ProbabilityResult,
  Question,
  ReasoningContext,
} from "../model";

import {
  ContradictionEngine,
} from "./ContradictionEngine";

import {
  InformationGainEngine,
} from "./InformationGainEngine";

import {
  NextQuestionSelector,
} from "./selection/NextQuestionSelector";

import {
  ProbabilityEngine,
} from "./ProbabilityEngine";

export type DecisionType =
  | "conclude"
  | "ask_question"
  | "manual_review"
  | "insufficient_information";

export interface DecisionThresholds {

  conclusionProbability: number;

  minimumLead: number;

  minimumEvidenceCoverage: number;

  maximumCriticalContradictionSeverity: number;

  minimumQuestionGain: number;

  maximumAlternatives: number;

}

export interface DecisionExplanation {

  summary: string;

  supportingEvidenceIds: string[];

  contradictingEvidenceIds: string[];

  missingRequiredEvidenceIds: string[];

  contradictionReasons: string[];

}

export interface DecisionResult {

  type: DecisionType;

  diagnostic: DiagnosticResult;

  selectedQuestion: Question | null;

  probabilities: ProbabilityResult[];

  informationGains: InformationGain[];

  contradictions: Contradiction[];

  explanation: DecisionExplanation;

  metrics: {

    topProbability: number;

    secondProbability: number;

    lead: number;

    evidenceCoverage: number;

    contradictionSeverity: number;

    activeHypothesisCount: number;

  };

}

interface HypothesisEvidenceState {

  supportingConfirmed: string[];

  supportingRejected: string[];

  contradictingConfirmed: string[];

  requiredConfirmed: string[];

  requiredRejected: string[];

  requiredMissing: string[];

}

interface DecisionSnapshot {

  probabilities: ProbabilityResult[];

  informationGains: InformationGain[];

  contradictions: Contradiction[];

  top: ProbabilityResult | null;

  second: ProbabilityResult | null;

  lead: number;

  evidenceState: HypothesisEvidenceState | null;

  evidenceCoverage: number;

  contradictionSeverity: number;

}

const DEFAULT_THRESHOLDS: DecisionThresholds = {

  conclusionProbability: 0.72,

  minimumLead: 0.16,

  minimumEvidenceCoverage: 0.5,

  maximumCriticalContradictionSeverity: 0.78,

  minimumQuestionGain: 0.05,

  maximumAlternatives: 3,

};

/**
 * Orchestre les moteurs probabiliste, informationnel et contradictoire.
 *
 * Ce moteur ne modifie jamais le ReasoningContext. Il transforme l'Ò©tat
 * courant du raisonnement en une dÒ©cision dÒ©terministe et explicable.
 */
export class DecisionEngine {

  private readonly probabilityEngine:
    ProbabilityEngine;

  private readonly informationGainEngine:
    InformationGainEngine;

  private readonly contradictionEngine:
    ContradictionEngine;

  private readonly questionSelector =
    new NextQuestionSelector();

  private readonly thresholds:
    DecisionThresholds;

  public constructor(
    probabilityEngine =
      new ProbabilityEngine(),

    informationGainEngine =
      new InformationGainEngine(),

    contradictionEngine =
      new ContradictionEngine(),

    thresholds:
      Partial<DecisionThresholds> = {},
  ) {

    this.probabilityEngine =
      probabilityEngine;

    this.informationGainEngine =
      informationGainEngine;

    this.contradictionEngine =
      contradictionEngine;

    this.thresholds = {
      ...DEFAULT_THRESHOLDS,
      ...thresholds,
    };

    this.validateThresholds(
      this.thresholds,
    );

  }

  public decide(
    context: ReasoningContext,
  ): DecisionResult {

    const snapshot =
      this.buildSnapshot(context);

    let type =
      this.selectDecisionType(
        context,
        snapshot,
      );

    let selectedQuestion =
      type === "ask_question"
        ? this.selectQuestion(
            snapshot.informationGains,
            context,
          )
        : null;

    if (
      type === "ask_question" &&
      selectedQuestion === null
    ) {
      type = "insufficient_information";

      selectedQuestion =
        null;
    }

    const explanation =
      this.buildExplanation(
        type,
        snapshot,
      );

    return {

      type,

      diagnostic:
        this.buildDiagnostic(
          type,
          snapshot,
          explanation,
        ),

      selectedQuestion,

      probabilities:
        snapshot.probabilities,

      informationGains:
        snapshot.informationGains,

      contradictions:
        snapshot.contradictions,

      explanation,

      metrics: {

        topProbability:
          snapshot.top?.probability ?? 0,

        secondProbability:
          snapshot.second?.probability ?? 0,

        lead:
          snapshot.lead,

        evidenceCoverage:
          snapshot.evidenceCoverage,

        contradictionSeverity:
          snapshot.contradictionSeverity,

        activeHypothesisCount:
          this.countActiveHypotheses(
            context,
          ),

      },

    };

  }

  private buildSnapshot(
    context: ReasoningContext,
  ): DecisionSnapshot {

    const probabilities =
      this.probabilityEngine.compute(
        context,
      );

    const informationGains =
      this.informationGainEngine.evaluate(
        context,
      );

    const contradictions =
      this.normalizeContradictions(
        context,
        this.contradictionEngine.evaluate(
          context,
        ),
      );

    const top =
      probabilities[0] ?? null;

    const second =
      probabilities[1] ?? null;

    const lead =
      this.clampUnit(
        (top?.probability ?? 0) -
        (second?.probability ?? 0),
      );

    const evidenceState =
      top
        ? this.inspectHypothesisEvidence(
            context,
            top.hypothesis,
          )
        : null;

    return {

      probabilities,

      informationGains,

      contradictions,

      top,

      second,

      lead,

      evidenceState,

      evidenceCoverage:
        evidenceState
          ? this.computeEvidenceCoverage(
              evidenceState,
            )
          : 0,

      contradictionSeverity:
        this.maximumContradictionSeverity(
          contradictions,
        ),

    };

  }

  private selectDecisionType(
    context: ReasoningContext,
    snapshot: DecisionSnapshot,
  ): DecisionType {

    if (
      snapshot.probabilities.length === 0 ||
      !snapshot.top
    ) {
      return "insufficient_information";
    }

    if (
      snapshot.contradictionSeverity >=
      this.thresholds
        .maximumCriticalContradictionSeverity
    ) {
      return "manual_review";
    }

    if (
      snapshot.evidenceState &&
      snapshot.evidenceState
        .requiredRejected.length > 0
    ) {
      return this.hasUsefulQuestion(
        snapshot.informationGains,
      )
        ? "ask_question"
        : "manual_review";
    }

    const conclusionReady =
      this.isConclusionReady(
        context,
        snapshot,
      );

    if (conclusionReady) {
      return "conclude";
    }

    if (
      this.hasUsefulQuestion(
        snapshot.informationGains,
      )
    ) {
      return "ask_question";
    }

    if (
      this.hasUnresolvedEvidence(
        context,
      )
    ) {
      return "insufficient_information";
    }

    return snapshot.top.probability >= 0.5
      ? "manual_review"
      : "insufficient_information";

  }

  private isConclusionReady(
    context: ReasoningContext,
    snapshot: DecisionSnapshot,
  ): boolean {

    if (!snapshot.top) {
      return false;
    }

    const standardProbabilityReached =
      snapshot.top.probability >=
      this.thresholds
        .conclusionProbability;

    const dominantEvidenceBackedConclusion =
      snapshot.top.probability >= 0.65 &&
      snapshot.lead >= 0.30 &&
      snapshot.evidenceCoverage >= 1 &&
      snapshot.evidenceState !== null &&
      snapshot.evidenceState
        .supportingConfirmed.length > 0 &&
      snapshot.evidenceState
        .requiredMissing.length === 0 &&
      snapshot.evidenceState
        .requiredRejected.length === 0 &&
      context.completedQuestionIds.size >= 3;

    if (
      !standardProbabilityReached &&
      !dominantEvidenceBackedConclusion
    ) {
      return false;
    }

    if (
      snapshot.lead <
      this.thresholds.minimumLead
    ) {
      return false;
    }

    if (
      snapshot.evidenceCoverage <
      this.thresholds
        .minimumEvidenceCoverage
    ) {
      return false;
    }

    if (
      snapshot.evidenceState &&
      snapshot.evidenceState
        .requiredMissing.length > 0
    ) {
      return false;
    }

    return true;

  }

  private hasUsefulQuestion(
    gains: InformationGain[],
  ): boolean {

    const first =
      gains[0];

    if (!first) {
      return false;
    }

    return (
      Number.isFinite(first.gain) &&
      first.gain >=
        this.thresholds.minimumQuestionGain
    );

  }

  private selectQuestion(
    gains:
      InformationGain[],

    context:
      ReasoningContext,
  ): Question | null {

    return this.questionSelector.select(
      gains,
      context,
    );

  }

  private inspectHypothesisEvidence(
    context: ReasoningContext,
    hypothesis: Hypothesis,
  ): HypothesisEvidenceState {

    const supportingConfirmed =
      hypothesis.supportingEvidenceIds.filter(
        id =>
          context.confirmedEvidenceIds.has(id),
      );

    const supportingRejected =
      hypothesis.supportingEvidenceIds.filter(
        id =>
          context.rejectedEvidenceIds.has(id),
      );

    const contradictingConfirmed =
      hypothesis.contradictingEvidenceIds.filter(
        id =>
          context.confirmedEvidenceIds.has(id),
      );

    const requiredConfirmed =
      hypothesis.requiredEvidenceIds.filter(
        id =>
          context.confirmedEvidenceIds.has(id),
      );

    const requiredRejected =
      hypothesis.requiredEvidenceIds.filter(
        id =>
          context.rejectedEvidenceIds.has(id),
      );

    const requiredMissing =
      hypothesis.requiredEvidenceIds.filter(
        id =>
          !context.confirmedEvidenceIds.has(id) &&
          !context.rejectedEvidenceIds.has(id),
      );

    return {

      supportingConfirmed,

      supportingRejected,

      contradictingConfirmed,

      requiredConfirmed,

      requiredRejected,

      requiredMissing,

    };

  }

  private computeEvidenceCoverage(
    state: HypothesisEvidenceState,
  ): number {

    const relevantCount =
      state.supportingConfirmed.length +
      state.supportingRejected.length +
      state.contradictingConfirmed.length +
      state.requiredConfirmed.length +
      state.requiredRejected.length +
      state.requiredMissing.length;

    if (relevantCount === 0) {
      return 0;
    }

    const resolvedCount =
      state.supportingConfirmed.length +
      state.supportingRejected.length +
      state.contradictingConfirmed.length +
      state.requiredConfirmed.length +
      state.requiredRejected.length;

    return this.clampUnit(
      resolvedCount / relevantCount,
    );

  }

  private hasUnresolvedEvidence(
    context: ReasoningContext,
  ): boolean {

    for (
      const evidence
      of context.evidences.values()
    ) {

      if (
        evidence.status === "unknown" ||
        evidence.status === "uncertain"
      ) {
        return true;
      }

    }

    return false;

  }

  private countActiveHypotheses(
    context: ReasoningContext,
  ): number {

    if (
      context.activeHypothesisIds.size > 0
    ) {
      return context.activeHypothesisIds.size;
    }

    let count = 0;

    for (
      const hypothesis
      of context.hypotheses.values()
    ) {

      if (
        !context.eliminatedHypothesisIds.has(
          hypothesis.id,
        )
      ) {
        count++;
      }

    }

    return count;

  }

  private normalizeContradictions(
    context: ReasoningContext,
    raw:
      Contradiction[] |
      string[],
  ): Contradiction[] {

    return raw.map(item => {

      if (typeof item !== "string") {
        return {
          evidence: item.evidence,
          reason: item.reason,
          severity:
            this.clampUnit(
              item.severity,
            ),
        };
      }

      const evidence =
        context.evidences.get(item) ?? {

          id: item,

          value: null,

          status: "unknown" as const,

          reliability: 0,

          source: "inference" as const,

        };

      return {

        evidence,

        reason:
          `La preuve "${item}" possÒ¨de des Ò©tats incompatibles.`,

        severity: 1,

      };

    });

  }

  private maximumContradictionSeverity(
    contradictions: Contradiction[],
  ): number {

    let maximum = 0;

    for (
      const contradiction
      of contradictions
    ) {

      maximum = Math.max(
        maximum,
        this.clampUnit(
          contradiction.severity,
        ),
      );

    }

    return maximum;

  }

  private buildDiagnostic(
    type: DecisionType,
    snapshot: DecisionSnapshot,
    explanation: DecisionExplanation,
  ): DiagnosticResult {

    const primary =
      snapshot.top?.hypothesis;

    const alternatives =
      snapshot.probabilities
        .slice(
          1,
          1 +
          this.thresholds.maximumAlternatives,
        )
        .map(result => result.hypothesis);

    return {

      confidence:
        this.toConfidence(
          snapshot.top?.probability ?? 0,
        ),

      hypothesis:
        type === "conclude" ||
        type === "manual_review"
          ? primary
          : undefined,

      alternatives,

      explanation:
        explanation.summary,

    };

  }

  private buildExplanation(
    type: DecisionType,
    snapshot: DecisionSnapshot,
  ): DecisionExplanation {

    const top =
      snapshot.top;

    const state =
      snapshot.evidenceState;

    if (!top || !state) {

      return {

        summary:
          "Aucune hypothÒ¨se exploitable n'est disponible dans le contexte de raisonnement.",

        supportingEvidenceIds: [],

        contradictingEvidenceIds: [],

        missingRequiredEvidenceIds: [],

        contradictionReasons:
          snapshot.contradictions.map(
            item => item.reason,
          ),

      };

    }

    const probability =
      Math.round(
        top.probability * 100,
      );

    const summary =
      this.createSummary(
        type,
        top.hypothesis,
        probability,
        snapshot,
      );

    return {

      summary,

      supportingEvidenceIds:
        state.supportingConfirmed,

      contradictingEvidenceIds: [
        ...state.contradictingConfirmed,
        ...state.supportingRejected,
        ...state.requiredRejected,
      ],

      missingRequiredEvidenceIds:
        state.requiredMissing,

      contradictionReasons:
        snapshot.contradictions.map(
          item => item.reason,
        ),

    };

  }

  private createSummary(
    type: DecisionType,
    hypothesis: Hypothesis,
    probability: number,
    snapshot: DecisionSnapshot,
  ): string {

    switch (type) {

      case "conclude":

        return (
          `Diagnostic retenu : ${hypothesis.name}. ` +
          `Probabilité ${probability} %, avance ` +
          `${Math.round(snapshot.lead * 100)} points et couverture des preuves ` +
          `${Math.round(snapshot.evidenceCoverage * 100)} %.`
        );

      case "ask_question":

        return (
          `L'hypothèse principale est "${hypothesis.name}" ` +
          `à ${probability} %, mais une information supplémentaire ` +
          `est nécessaire avant de conclure.`
        );

      case "manual_review":

        return (
          `L'hypothÒ¨se principale est "${hypothesis.name}" ` +
          `Ò  ${probability} %, mais les contradictions ou les preuves ` +
          `obligatoires empÒªchent une conclusion automatique sÒ»re.`
        );

      case "insufficient_information":

        return (
          `Les informations disponibles ne permettent pas encore ` +
          `de confirmer "${hypothesis.name}" avec un niveau suffisant.`
        );

    }

  }

  private toConfidence(
    probability: number,
  ): Hypothesis["confidence"] {

    return this.clampUnit(
      probability,
    ) as Hypothesis["confidence"];

  }

  private clampUnit(
    value: number,
  ): number {

    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.min(
      1,
      Math.max(
        0,
        value,
      ),
    );

  }

  private validateThresholds(
    thresholds: DecisionThresholds,
  ): void {

    const unitValues: Array<
      [string, number]
    > = [

      [
        "conclusionProbability",
        thresholds.conclusionProbability,
      ],

      [
        "minimumLead",
        thresholds.minimumLead,
      ],

      [
        "minimumEvidenceCoverage",
        thresholds.minimumEvidenceCoverage,
      ],

      [
        "maximumCriticalContradictionSeverity",
        thresholds
          .maximumCriticalContradictionSeverity,
      ],

    ];

    for (
      const [name, value]
      of unitValues
    ) {

      if (
        !Number.isFinite(value) ||
        value < 0 ||
        value > 1
      ) {
        throw new RangeError(
          `${name} doit Òªtre compris entre 0 et 1.`,
        );
      }

    }

    if (
      !Number.isFinite(
        thresholds.minimumQuestionGain,
      ) ||
      thresholds.minimumQuestionGain < 0
    ) {
      throw new RangeError(
        "minimumQuestionGain doit Òªtre positif ou nul.",
      );
    }

    if (
      !Number.isInteger(
        thresholds.maximumAlternatives,
      ) ||
      thresholds.maximumAlternatives < 0
    ) {
      throw new RangeError(
        "maximumAlternatives doit Òªtre un entier positif ou nul.",
      );
    }

  }

}


