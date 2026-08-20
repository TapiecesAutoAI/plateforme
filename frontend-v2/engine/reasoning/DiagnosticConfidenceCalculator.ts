export interface DiagnosticConfidenceFactors {

  hypothesisConfidence:
    number;

  informationGain:
    number;

  contradictionCount:
    number;

  answeredQuestions:
    number;

  similarCases?:
    number;

  validatedRepairs?:
    number;

}

export interface DiagnosticConfidenceResult {

  confidence:
    number;

  stars:
    1 | 2 | 3 | 4 | 5;

  explanation:
    string[];

}

export class DiagnosticConfidenceCalculator {

  public calculate(

    factors:
      DiagnosticConfidenceFactors,

  ): DiagnosticConfidenceResult {

    let score =
      factors.hypothesisConfidence;

    const explanation:
      string[] = [];

    score +=
      Math.min(
        10,
        factors.informationGain * 0.15,
      );

    if (
      factors.informationGain > 25
    ) {

      explanation.push(
        "Symptômes très discriminants",
      );

    }

    score -=
      factors.contradictionCount * 8;

    if (
      factors.contradictionCount >
      0
    ) {

      explanation.push(
        "Quelques réponses contradictoires",
      );

    }

    if (
      factors.answeredQuestions <=
      6
    ) {

      score +=
        4;

      explanation.push(
        "Diagnostic obtenu rapidement",
      );

    }

    if (
      (
        factors.similarCases ??
        0
      ) > 20
    ) {

      score +=
        5;

      explanation.push(
        `${factors.similarCases} cas similaires`,
      );

    }

    if (
      (
        factors.validatedRepairs ??
        0
      ) > 10
    ) {

      score +=
        5;

      explanation.push(
        `${factors.validatedRepairs} réparations confirmées`,
      );

    }

    score =
      Math.max(
        0,
        Math.min(
          100,
          Math.round(
            score,
          ),
        ),
      );

    const stars =
      score >= 95
        ? 5
        : score >= 85
        ? 4
        : score >= 70
        ? 3
        : score >= 50
        ? 2
        : 1;

    if (
      explanation.length ===
      0
    ) {

      explanation.push(
        "Confiance basée sur les symptômes disponibles",
      );

    }

    return {

      confidence:
        score,

      stars,

      explanation,

    };

  }

}
