import type {
  Contradiction,
  ProbabilityResult,
  Question,
  ReasoningContext,
} from "../model";

export type DiagnosticCompletionState =
  | "continue"
  | "offer_stop"
  | "complete";

export interface DiagnosticAlternative {
  hypothesisId: string;
  label: string;
  probability: number;
  confidencePercentage: number;
}

export interface DiagnosticCompletionAdvice {
  state: DiagnosticCompletionState;

  hypothesisId: string | null;
  hypothesisLabel: string | null;

  confidence: number;
  confidencePercentage: number;

  lead: number;
  supportingEvidenceCount: number;
  answeredQuestionCount: number;

  nextBestQuestionId: string | null;
  nextBestQuestionText: string | null;

  estimatedGain: number;
  estimatedGainPercentage: number;

  estimatedRemainingQuestions: number;
  estimatedRemainingSeconds: number;

  alternatives: DiagnosticAlternative[];

  message: string;
}

export interface DiagnosticCompletionAdvisorOptions {
  minimumAnsweredQuestions: number;
  minimumSupportingEvidence: number;

  offerStopProbability: number;
  completeProbability: number;

  offerStopLead: number;
  completeLead: number;

  maximumContradictionSeverity: number;
  maximumAlternatives: number;

  estimatedSecondsPerQuestion: number;
}

const DEFAULT_OPTIONS: DiagnosticCompletionAdvisorOptions = {
  minimumAnsweredQuestions: 3,
  minimumSupportingEvidence: 2,

  offerStopProbability: 0.65,
  completeProbability: 0.92,

  offerStopLead: 0.08,
  completeLead: 0.18,

  maximumContradictionSeverity: 0.65,
  maximumAlternatives: 3,

  estimatedSecondsPerQuestion: 20,
};


const STOP_ENGINE = {
  minimumPrimaryConfidence: 0.72,
  decisiveLead: 0.20,
  weakAlternativeThreshold: 0.10,
  minimumUsefulGain: 0.03,
  hardQuestionLimit: 7,
} as const;

function shouldStopEarly(
  confidence: number,
  lead: number,
  estimatedQuestionGain: number,
  alternatives: readonly {
    probability: number;
  }[],
  answeredQuestionCount: number,
): boolean {
  if (
    answeredQuestionCount >=
    STOP_ENGINE.hardQuestionLimit
  ) {
    return true;
  }

  if (
    confidence >=
      STOP_ENGINE.minimumPrimaryConfidence &&
    lead >=
      STOP_ENGINE.decisiveLead &&
    estimatedQuestionGain <
      STOP_ENGINE.minimumUsefulGain
  ) {
    return true;
  }

  const strongestAlternative =
    alternatives[0]?.probability ??
    0;

  if (
    confidence >=
      0.75 &&
    strongestAlternative <=
      STOP_ENGINE.weakAlternativeThreshold &&
    estimatedQuestionGain <
      0.05
  ) {
    return true;
  }

  return false;
}
export class DiagnosticCompletionAdvisor {
  private readonly options: DiagnosticCompletionAdvisorOptions;

  public constructor(
    options: Partial<DiagnosticCompletionAdvisorOptions> = {},
  ) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    this.validateOptions(this.options);
  }

  public evaluate(
    context: ReasoningContext,
    probabilities: ProbabilityResult[],
    contradictions: Contradiction[],
    selectedQuestion: Question | null,
    answeredQuestionCount: number,
    estimatedQuestionGain = 0,
  ): DiagnosticCompletionAdvice {
    const top = probabilities[0] ?? null;
    const second = probabilities[1] ?? null;

    if (!top) {
      return this.createEmptyAdvice(
        selectedQuestion,
        answeredQuestionCount,
      );
    }

    const confidence = this.clampUnit(
      top.probability,
    );

    const secondConfidence = this.clampUnit(
      second?.probability ?? 0,
    );

    const lead = Math.max(
      0,
      confidence - secondConfidence,
    );

    const supportingEvidenceCount =
      top.hypothesis.supportingEvidenceIds.filter(
        evidenceId =>
          context.confirmedEvidenceIds.has(
            evidenceId,
          ),
      ).length;

    const contradictionSeverity =
      this.getMaximumContradictionSeverity(
        contradictions,
      );

    const hasRejectedRequiredEvidence =
      top.hypothesis.requiredEvidenceIds.some(
        evidenceId =>
          context.rejectedEvidenceIds.has(
            evidenceId,
          ),
      );

    const enoughQuestions =
      answeredQuestionCount >=
      this.options.minimumAnsweredQuestions;

    const enoughEvidence =
      supportingEvidenceCount >=
      this.options.minimumSupportingEvidence;

    const contradictionAcceptable =
      contradictionSeverity <
      this.options.maximumContradictionSeverity;

    const canOfferStop =
      enoughQuestions &&
      enoughEvidence &&
      contradictionAcceptable &&
      !hasRejectedRequiredEvidence &&
      confidence >=
        this.options.offerStopProbability &&
      lead >=
        this.options.offerStopLead;

    const canComplete =
      canOfferStop &&
      confidence >=
        this.options.completeProbability &&
      lead >=
        this.options.completeLead;

    const state: DiagnosticCompletionState =
      canComplete
        ? "complete"
        : canOfferStop
          ? "offer_stop"
          : "continue";

    const normalizedGain =
      this.clampUnit(
        estimatedQuestionGain,
      );

    const alternatives =
      probabilities
        .slice(
          1,
          1 +
          this.options.maximumAlternatives,
        )
        .map(
          result => ({
            hypothesisId:
              result.hypothesis.id,

            label:
              result.hypothesis.name,

            probability:
              this.clampUnit(
                result.probability,
              ),

            confidencePercentage:
              Math.round(
                this.clampUnit(
                  result.probability,
                ) * 100,
              ),
          }),
        );

    const stopEarly =
      canOfferStop &&
      shouldStopEarly(
        confidence,
        lead,
        normalizedGain,
        alternatives,
        answeredQuestionCount,
      );

    if (
      stopEarly
    ) {
      return {
        state:
          "complete",

        hypothesisId:
          top.hypothesis.id,

        hypothesisLabel:
          top.hypothesis.name,

        confidence,

        confidencePercentage:
          Math.round(
            confidence *
            100,
          ),

        lead,

        supportingEvidenceCount,

        answeredQuestionCount,

        nextBestQuestionId:
          null,

        nextBestQuestionText:
          null,

        estimatedGain:
          normalizedGain,

        estimatedGainPercentage:
          Math.round(
            normalizedGain *
            100,
          ),

        estimatedRemainingQuestions:
          0,

        estimatedRemainingSeconds:
          0,

        alternatives,

        message:
          "Le diagnostic est suffisamment stable. Les questions restantes ont peu de chances de modifier la pièce recommandée.",
      };
    }

    const remainingQuestions =
      this.estimateRemainingQuestions(
        confidence,
        state,
        normalizedGain,
      );

    return {
      state,

      hypothesisId:
        top.hypothesis.id,

      hypothesisLabel:
        top.hypothesis.name,

      confidence,

      confidencePercentage:
        Math.round(
          confidence * 100,
        ),

      lead,

      supportingEvidenceCount,
      answeredQuestionCount,

      nextBestQuestionId:
        selectedQuestion?.id ??
        null,

      nextBestQuestionText:
        selectedQuestion?.text ??
        null,

      estimatedGain:
        normalizedGain,

      estimatedGainPercentage:
        Math.round(
          normalizedGain * 100,
        ),

      estimatedRemainingQuestions:
        remainingQuestions,

      estimatedRemainingSeconds:
        remainingQuestions *
        this.options
          .estimatedSecondsPerQuestion,

      alternatives,

      message:
        this.buildMessage(
          state,
          top.hypothesis.name,
          confidence,
          remainingQuestions,
        ),
    };
  }

  private estimateRemainingQuestions(
    confidence: number,
    state: DiagnosticCompletionState,
    estimatedGain: number,
  ): number {
    if (state === "complete") {
      return 0;
    }

    const target =
      state === "offer_stop"
        ? this.options.completeProbability
        : this.options.offerStopProbability;

    const missing =
      Math.max(
        0,
        target - confidence,
      );

    const gainPerQuestion =
      estimatedGain > 0.01
        ? estimatedGain
        : 0.06;

    return Math.min(
      5,
      Math.max(
        1,
        Math.ceil(
          missing /
          gainPerQuestion,
        ),
      ),
    );
  }

  private buildMessage(
    state: DiagnosticCompletionState,
    hypothesisLabel: string,
    confidence: number,
    remainingQuestions: number,
  ): string {
    const percentage =
      Math.round(
        confidence * 100,
      );

    if (state === "complete") {
      return (
        `Le diagnostic principal est « ${hypothesisLabel} » ` +
        `avec une confiance de ${percentage} %.`
      );
    }

    if (state === "offer_stop") {
      return (
        `Nous pensons avoir trouvé la panne : ` +
        `« ${hypothesisLabel} » (${percentage} %). ` +
        `Vous pouvez afficher le résultat maintenant ` +
        `ou continuer environ ${remainingQuestions} question(s).`
      );
    }

    return (
      `Le diagnostic doit continuer. ` +
      `Hypothèse actuelle : « ${hypothesisLabel} » ` +
      `avec ${percentage} % de confiance.`
    );
  }

  private createEmptyAdvice(
    selectedQuestion: Question | null,
    answeredQuestionCount: number,
  ): DiagnosticCompletionAdvice {
    return {
      state: "continue",

      hypothesisId: null,
      hypothesisLabel: null,

      confidence: 0,
      confidencePercentage: 0,

      lead: 0,
      supportingEvidenceCount: 0,
      answeredQuestionCount,

      nextBestQuestionId:
        selectedQuestion?.id ??
        null,

      nextBestQuestionText:
        selectedQuestion?.text ??
        null,

      estimatedGain: 0,
      estimatedGainPercentage: 0,

      estimatedRemainingQuestions: 1,
      estimatedRemainingSeconds:
        this.options
          .estimatedSecondsPerQuestion,

      alternatives: [],

      message:
        "Le diagnostic doit continuer.",
    };
  }

  private getMaximumContradictionSeverity(
    contradictions: Contradiction[],
  ): number {
    let maximum = 0;

    for (const contradiction of contradictions) {
      maximum = Math.max(
        maximum,
        this.clampUnit(
          contradiction.severity,
        ),
      );
    }

    return maximum;
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

  private validateOptions(
    options: DiagnosticCompletionAdvisorOptions,
  ): void {
    const unitValues: Array<
      [string, number]
    > = [
      [
        "offerStopProbability",
        options.offerStopProbability,
      ],
      [
        "completeProbability",
        options.completeProbability,
      ],
      [
        "offerStopLead",
        options.offerStopLead,
      ],
      [
        "completeLead",
        options.completeLead,
      ],
      [
        "maximumContradictionSeverity",
        options.maximumContradictionSeverity,
      ],
    ];

    for (const [name, value] of unitValues) {
      if (
        !Number.isFinite(value) ||
        value < 0 ||
        value > 1
      ) {
        throw new RangeError(
          `${name} doit être compris entre 0 et 1.`,
        );
      }
    }

    if (
      options.completeProbability <
      options.offerStopProbability
    ) {
      throw new RangeError(
        "completeProbability doit être supérieur ou égal à offerStopProbability.",
      );
    }

    if (
      options.completeLead <
      options.offerStopLead
    ) {
      throw new RangeError(
        "completeLead doit être supérieur ou égal à offerStopLead.",
      );
    }

    if (
      !Number.isInteger(
        options.minimumAnsweredQuestions,
      ) ||
      options.minimumAnsweredQuestions < 1
    ) {
      throw new RangeError(
        "minimumAnsweredQuestions doit être un entier supérieur ou égal à 1.",
      );
    }

    if (
      !Number.isInteger(
        options.minimumSupportingEvidence,
      ) ||
      options.minimumSupportingEvidence < 1
    ) {
      throw new RangeError(
        "minimumSupportingEvidence doit être un entier supérieur ou égal à 1.",
      );
    }

    if (
      !Number.isInteger(
        options.maximumAlternatives,
      ) ||
      options.maximumAlternatives < 0
    ) {
      throw new RangeError(
        "maximumAlternatives doit être un entier positif ou nul.",
      );
    }

    if (
      !Number.isFinite(
        options.estimatedSecondsPerQuestion,
      ) ||
      options.estimatedSecondsPerQuestion <= 0
    ) {
      throw new RangeError(
        "estimatedSecondsPerQuestion doit être strictement positif.",
      );
    }
  }
}
