import {
  AdaptiveQuestionSelector,
  type AdaptiveQuestion,
} from "../adaptive/AdaptiveQuestionSelector";

import {
  ReasoningPipeline,
} from "../pipeline/ReasoningPipeline";

import {
  TrustEngine,
} from "../trust/TrustEngine";

import {
  DiagnosticGuardEngine,
} from "../guard/DiagnosticGuardEngine";

import type {
  ReasoningProfileId,
} from "../../model";

export interface AutopilotInput {

  questions:
    AdaptiveQuestion[];

  answeredFamilies:
    string[];

  hypotheses:
    {
      id: string;
      confidence: number;
    }[];

  audience:
    "particulier"
    | "professionnel"
    | "expert";

  profileId?:
    ReasoningProfileId;

  answeredQuestionCount:
    number;

  contradictionCount:
    number;

  similarCases:
    number;

  validatedRepairs:
    number;

  answerQuality:
    number;

  vinValidated:
    boolean;


  supportingEvidenceCount?:
    number;

  alternativeProbability?:
    number;
}

export class DiagnosticAutopilot {

  private readonly selector =
    new AdaptiveQuestionSelector();

  private readonly pipeline =
    new ReasoningPipeline();

  private readonly trust =
    new TrustEngine();

  private readonly guard =
    new DiagnosticGuardEngine();

  public execute(
    input:
      AutopilotInput,
  ) {

    const candidates =
      this.selector.select(
        input.questions,
        {
          answeredFamilies:
            input.answeredFamilies,
          fatigue:
            input.answeredQuestionCount,
          audience:
            input.audience,
        },
      );

    if (
      candidates.length === 0
    ) {

      return {

        nextQuestion:
          null,

        finished:
          true,

      };

    }

    const nextQuestion =
      candidates[0];

    const pipeline =
      this.pipeline.evaluate({

        question:
          nextQuestion,

        hypotheses:
          input.hypotheses,

        answeredQuestionCount:
          input.answeredQuestionCount,

        contradictionCount:
          input.contradictionCount,

        similarCases:
          input.similarCases,

        validatedRepairs:
          input.validatedRepairs,


        supportingEvidenceCount:
          input.supportingEvidenceCount,

        alternativeProbability:
          input.alternativeProbability,

        profileId:
          input.profileId,
      });

    const trust =
      this.trust.evaluate({

        diagnosticConfidence:
          pipeline.confidence,

        answerQuality:
          input.answerQuality,

        contradictionCount:
          input.contradictionCount,

        similarCases:
          input.similarCases,

        validatedRepairs:
          input.validatedRepairs,

        vinValidated:
          input.vinValidated,

      });

    const rawGuard =
      this.guard.evaluate({

        confidence:
          pipeline.confidence,

        trustScore:
          trust.trustScore,

        answerQuality:
          input.answerQuality,

        contradictionCount:
          input.contradictionCount,

        similarCases:
          input.similarCases,

        validatedRepairs:
          input.validatedRepairs,

        vinValidated:
          input.vinValidated,

      });

    const guard = {
      ...rawGuard,

      allowSell:
        rawGuard.allowSell &&
        pipeline.decision.shouldSell,

      reason:
        rawGuard.allowSell &&
        !pipeline.decision.shouldSell
          ? "La vente reste bloquée par la décision diagnostique principale."
          : rawGuard.reason,
    };

    return {

      nextQuestion,

      pipeline,

      trust,

      guard,

      finished:

        pipeline.decision.shouldStop &&
        !pipeline.decision.shouldTest &&
        !guard.requireSimpleTest &&
        (
          guard.allowSell ||
          guard.allowConclusion ||
          guard.requireHumanReview
        ),

    };

  }

}
