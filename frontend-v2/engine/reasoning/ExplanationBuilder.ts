import type {
  DiagnosticSession,
} from "../core/sessionTypes";

import type {
  KnowledgePackage,
} from "../knowledge";

import type {
  ReasoningResult,
} from "./ReasoningEngine";

export type ReasoningExplanation = {
  summary: string;

  supportingEvidence: string[];

  alternativeHypotheses: {
    id: string;
    label: string;
    probability: number;
  }[];

  selectedQuestionReason:
    string | null;
};

export class ExplanationBuilder {
  public build(
    session: DiagnosticSession,
    knowledge: KnowledgePackage,
    reasoning: ReasoningResult,
  ): ReasoningExplanation {
    const primary =
      reasoning.confidence.primary;

    const supportingEvidence =
      session.evidence.map(
        (evidence) =>
          evidence.label,
      );

    const alternatives =
      reasoning.hypotheses
        .filter(
          (hypothesis) =>
            hypothesis.id !==
            primary?.id &&
            hypothesis.probability > 0,
        )
        .slice(
          0,
          3,
        )
        .map(
          (hypothesis) => ({
            id:
              hypothesis.id,

            label:
              hypothesis.label,

            probability:
              hypothesis.probability,
          }),
        );

    const selectedQuestion =
      reasoning.selectedQuestion;

    const selectedQuestionReason =
      selectedQuestion
        ? `Cette question a été choisie car son gain d'information estimé est de ${Math.round(
            selectedQuestion.informationGain *
              100,
          )} %.`
        : null;

    const summary =
      primary
        ? `L'hypothèse principale est « ${primary.label} » avec une confiance de ${Math.round(
            primary.probability *
              100,
          )} %.`
        : "Aucune hypothèse principale n'est suffisamment établie.";

    return {
      summary,

      supportingEvidence,

      alternativeHypotheses:
        alternatives,

      selectedQuestionReason,
    };
  }
}
