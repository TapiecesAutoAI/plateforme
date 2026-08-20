export interface DiagnosticGuardInput {

  confidence:
    number;

  trustScore:
    number;

  answerQuality:
    number;

  contradictionCount:
    number;

  similarCases:
    number;

  validatedRepairs:
    number;

  vinValidated:
    boolean;

}

export interface DiagnosticGuardResult {

  allowSell:
    boolean;

  allowConclusion:
    boolean;

  requireExtraQuestion:
    boolean;

  requireSimpleTest:
    boolean;

  requireHumanReview:
    boolean;

  reason:
    string;

}

export class DiagnosticGuardEngine {

  public evaluate(

    input:
      DiagnosticGuardInput,

  ): DiagnosticGuardResult {

    if (

      input.contradictionCount >= 3

    ) {

      return {

        allowSell:
          false,

        allowConclusion:
          false,

        requireExtraQuestion:
          false,

        requireSimpleTest:
          false,

        requireHumanReview:
          true,

        reason:
          "Réponses contradictoires.",

      };

    }

    if (

      input.confidence >= 92 &&

      input.trustScore >= 90 &&

      input.answerQuality >= 85 &&

      input.vinValidated &&

      (
        input.similarCases >= 20 ||

        input.validatedRepairs >= 20

      )

    ) {

      return {

        allowSell:
          true,

        allowConclusion:
          true,

        requireExtraQuestion:
          false,

        requireSimpleTest:
          false,

        requireHumanReview:
          false,

        reason:
          "Confiance maximale.",

      };

    }

    if (

      input.confidence >= 80 &&

      input.trustScore >= 75

    ) {

      return {

        allowSell:
          false,

        allowConclusion:
          true,

        requireExtraQuestion:
          false,

        requireSimpleTest:
          true,

        requireHumanReview:
          false,

        reason:
          "Un test simple est recommandé avant la vente.",

      };

    }

    return {

      allowSell:
        false,

      allowConclusion:
        false,

      requireExtraQuestion:
        true,

      requireSimpleTest:
        false,

      requireHumanReview:
        false,

      reason:
        "Informations insuffisantes.",

    };

  }

}
