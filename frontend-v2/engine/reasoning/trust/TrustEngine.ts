export interface TrustInput {

  diagnosticConfidence:
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

export interface TrustScore {

  diagnosticScore:
    number;

  informationQuality:
    number;

  trustScore:
    number;

  level:
    "LOW"
    | "MEDIUM"
    | "HIGH"
    | "VERY_HIGH";

  messages:
    string[];

}

export class TrustEngine {

  public evaluate(

    input:
      TrustInput,

  ): TrustScore {

    let trust =

      input.diagnosticConfidence *
      0.55 +

      input.answerQuality *
      0.25;

    const messages:
      string[] =
      [];

    if (

      input.similarCases >

      25

    ) {

      trust +=
        5;

      messages.push(

        `${input.similarCases} cas similaires.`,

      );

    }

    if (

      input.validatedRepairs >

      20

    ) {

      trust +=
        5;

      messages.push(

        `${input.validatedRepairs} réparations confirmées.`,

      );

    }

    if (

      input.vinValidated

    ) {

      trust +=
        5;

      messages.push(

        "Compatibilité VIN vérifiée.",

      );

    }

    trust -=

      input.contradictionCount *
      5;

    if (

      input.contradictionCount >

      0

    ) {

      messages.push(

        "Quelques incohérences détectées.",

      );

    }

    trust =

      Math.max(

        0,

        Math.min(

          100,

          Math.round(

            trust,

          ),

        ),

      );

    const level =

      trust >= 95

        ? "VERY_HIGH"

        : trust >= 85

        ? "HIGH"

        : trust >= 65

        ? "MEDIUM"

        : "LOW";

    return {

      diagnosticScore:
        input.diagnosticConfidence,

      informationQuality:
        input.answerQuality,

      trustScore:
        trust,

      level,

      messages,

    };

  }

}
