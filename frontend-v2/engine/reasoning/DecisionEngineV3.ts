import type {
  ReasoningContext,
  ReasoningProfileId,
} from "../model";

export interface DiagnosticDecisionInput {
  questionId:
    string;

  informationGain:
    number;

  questionCost:
    number;

  confidence:
    number;

  fatigue:
    number;

  similarCases:
    number;

  validatedRepairs:
    number;

  contradictionCount:
    number;

  profileId?:
    ReasoningProfileId;

  answeredQuestionCount?:
    number;

  maximumQuestionCount?:
    number;

  supportingEvidenceCount?:
    number;

  alternativeProbability?:
    number;
}

export interface DiagnosticContextDecisionInput {
  questionId:
    string;

  informationGain:
    number;

  questionCost:
    number;

  confidence:
    number;

  similarCases?:
    number;

  validatedRepairs?:
    number;

  contradictionCount?:
    number;

  supportingEvidenceCount?:
    number;

  alternativeProbability?:
    number;
}

export type DiagnosticDecisionType =
  | "ask-question"
  | "recommend-test"
  | "conclude"
  | "sell-part"
  | "manual-review";

export interface DiagnosticDecision {
  type:
    DiagnosticDecisionType;

  roi:
    number;

  shouldStop:
    boolean;

  shouldSell:
    boolean;

  shouldAsk:
    boolean;

  shouldTest:
    boolean;

  confidence:
    number;

  explanation:
    string[];

  profileId:
    ReasoningProfileId;

  answeredQuestionCount:
    number;

  maximumQuestionCount:
    number;

  reachedQuestionLimit:
    boolean;
}

interface DecisionThresholds {
  sellConfidence:
    number;

  concludeConfidence:
    number;

  minimumSellEvidence:
    number;

  minimumUsefulRoi:
    number;

  testRoi:
    number;

  maximumAlternativeProbability:
    number;
}

const PROFILE_MAXIMUM_QUESTIONS:
  Record<ReasoningProfileId, number> = {
    particulier:
      6,

    bricoleur:
      9,

    "vendeur-pieces-auto":
      8,

    "mecanicien-garage":
      14,

    depanneur:
      6,
  };

const PROFILE_THRESHOLDS:
  Record<
    ReasoningProfileId,
    DecisionThresholds
  > = {
    particulier: {
      sellConfidence:
        90,

      concludeConfidence:
        76,

      minimumSellEvidence:
        2,

      minimumUsefulRoi:
        0.35,

      testRoi:
        0.18,

      maximumAlternativeProbability:
        22,
    },

    bricoleur: {
      sellConfidence:
        88,

      concludeConfidence:
        78,

      minimumSellEvidence:
        2,

      minimumUsefulRoi:
        0.3,

      testRoi:
        0.16,

      maximumAlternativeProbability:
        25,
    },

    "vendeur-pieces-auto": {
      sellConfidence:
        92,

      concludeConfidence:
        84,

      minimumSellEvidence:
        3,

      minimumUsefulRoi:
        0.32,

      testRoi:
        0.15,

      maximumAlternativeProbability:
        18,
    },

    "mecanicien-garage": {
      sellConfidence:
        94,

      concludeConfidence:
        88,

      minimumSellEvidence:
        3,

      minimumUsefulRoi:
        0.2,

      testRoi:
        0.1,

      maximumAlternativeProbability:
        15,
    },

    depanneur: {
      sellConfidence:
        95,

      concludeConfidence:
        72,

      minimumSellEvidence:
        2,

      minimumUsefulRoi:
        0.4,

      testRoi:
        0.22,

      maximumAlternativeProbability:
        30,
    },
  };

export class DecisionEngineV3 {
  public evaluateFromContext(
    context:
      ReasoningContext,

    input:
      DiagnosticContextDecisionInput,
  ): DiagnosticDecision {
    const profileId =
      context.metadata?.profileId ??
      "particulier";

    const answeredQuestionCount =
      context.progress
        ?.answeredQuestionCount ??
      context.completedQuestionIds.size;

    const maximumQuestionCount =
      context.progress
        ?.maximumQuestionCount ??
      PROFILE_MAXIMUM_QUESTIONS[
        profileId
      ];

    const inferredContradictions =
      this.countDirectContradictions(
        context,
      );

    return this.evaluate({
      questionId:
        input.questionId,

      informationGain:
        input.informationGain,

      questionCost:
        input.questionCost,

      confidence:
        input.confidence,

      fatigue:
        answeredQuestionCount,

      similarCases:
        input.similarCases ??
        0,

      validatedRepairs:
        input.validatedRepairs ??
        0,

      contradictionCount:
        input.contradictionCount ??
        inferredContradictions,

      profileId,

      answeredQuestionCount,

      maximumQuestionCount,

      supportingEvidenceCount:
        input.supportingEvidenceCount ??
        context.confirmedEvidenceIds.size,

      alternativeProbability:
        input.alternativeProbability ??
        0,
    });
  }

  public evaluate(
    input:
      DiagnosticDecisionInput,
  ): DiagnosticDecision {
    const profileId =
      input.profileId ??
      "particulier";

    const thresholds =
      PROFILE_THRESHOLDS[
        profileId
      ];

    const answeredQuestionCount =
      input.answeredQuestionCount ??
      Math.max(
        0,
        input.fatigue,
      );

    const maximumQuestionCount =
      input.maximumQuestionCount ??
      PROFILE_MAXIMUM_QUESTIONS[
        profileId
      ];

    const supportingEvidenceCount =
      input.supportingEvidenceCount ??
      0;

    const hasAlternativeProbability =
      input.alternativeProbability !==
      undefined;

    const alternativeProbability =
      input.alternativeProbability ??
      0;

    const reachedQuestionLimit =
      answeredQuestionCount >=
      maximumQuestionCount;

    const roi =
      Number(
        (
          input.informationGain /
          Math.max(
            1,
            input.questionCost,
          )
        ).toFixed(
          2,
        ),
      );

    const explanation:
      string[] = [];

    let shouldStop =
      false;

    let shouldSell =
      false;

    let shouldAsk =
      true;

    let shouldTest =
      false;

    let type:
      DiagnosticDecisionType =
      "ask-question";

    if (
      input.contradictionCount >
      2
    ) {
      type =
        "manual-review";

      shouldStop =
        true;

      shouldAsk =
        false;

      explanation.push(
        "Les réponses contiennent plusieurs contradictions.",
      );
    }

    else if (
      hasAlternativeProbability &&
      input.confidence >=
        thresholds.sellConfidence &&
      supportingEvidenceCount >=
        thresholds.minimumSellEvidence &&
      alternativeProbability <=
        thresholds
          .maximumAlternativeProbability
    ) {
      type =
        "sell-part";

      shouldStop =
        true;

      shouldSell =
        true;

      shouldAsk =
        false;

      explanation.push(
        "La confiance et les preuves sont suffisantes pour proposer la pièce.",
      );
    }

    else if (
      reachedQuestionLimit
    ) {
      type =
        input.confidence >=
        thresholds.concludeConfidence
          ? "conclude"
          : "recommend-test";

      shouldStop =
        true;

      shouldAsk =
        false;

      shouldTest =
        type ===
        "recommend-test";

      explanation.push(
        `La limite de ${maximumQuestionCount} questions du profil ${profileId} est atteinte.`,
      );
    }

    else if (
      input.confidence >=
        thresholds
          .concludeConfidence &&
      roi <
        thresholds
          .minimumUsefulRoi
    ) {
      type =
        "conclude";

      shouldStop =
        true;

      shouldAsk =
        false;

      explanation.push(
        "Le gain d'une question supplémentaire est devenu trop faible.",
      );
    }

    else if (
      roi <
      thresholds.testRoi
    ) {
      type =
        "recommend-test";

      shouldStop =
        true;

      shouldAsk =
        false;

      shouldTest =
        true;

      explanation.push(
        "Un contrôle pratique apportera davantage d'information qu'une nouvelle question.",
      );
    }

    else {
      explanation.push(
        "Une question supplémentaire reste utile.",
      );
    }

    if (
      input.similarCases >
      50
    ) {
      explanation.push(
        `${input.similarCases} cas similaires disponibles.`,
      );
    }

    if (
      input.validatedRepairs >
      25
    ) {
      explanation.push(
        `${input.validatedRepairs} réparations confirmées disponibles.`,
      );
    }

    return {
      type,

      roi,

      shouldStop,

      shouldSell,

      shouldAsk,

      shouldTest,

      confidence:
        input.confidence,

      explanation,

      profileId,

      answeredQuestionCount,

      maximumQuestionCount,

      reachedQuestionLimit,
    };
  }

  private countDirectContradictions(
    context:
      ReasoningContext,
  ): number {
    let count =
      0;

    for (
      const evidenceId
      of context.confirmedEvidenceIds
    ) {
      if (
        context.rejectedEvidenceIds.has(
          evidenceId,
        )
      ) {
        count +=
          1;
      }
    }

    return count;
  }
}
