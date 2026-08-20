import type {
  DashboardSummary,
} from "../dashboard/DiagnosticDashboardEngine";

export interface BenchmarkResult {

  score:
    number;

  grade:
    "A+"
    | "A"
    | "B"
    | "C"
    | "D";

  strengths:
    string[];

  weaknesses:
    string[];

}

export class BenchmarkEngine {

  public evaluate(

    dashboard:
      DashboardSummary,

  ): BenchmarkResult {

    const strengths:
      string[] =
      [];

    const weaknesses:
      string[] =
      [];

    if (

      dashboard.averageConfidence >=
      90

    ) {

      strengths.push(
        "Confiance élevée.",
      );

    }
    else {

      weaknesses.push(
        "Améliorer la précision.",
      );

    }

    if (

      dashboard.averageQuestions <=
      6

    ) {

      strengths.push(
        "Diagnostic rapide.",
      );

    }
    else {

      weaknesses.push(
        "Réduire le nombre de questions.",
      );

    }

    if (

      dashboard.customerSatisfaction >=
      90

    ) {

      strengths.push(
        "Clients satisfaits.",
      );

    }
    else {

      weaknesses.push(
        "Améliorer le taux de réussite.",
      );

    }

    if (

      dashboard.manualReviewRate >
      10

    ) {

      weaknesses.push(
        "Trop de revues manuelles.",
      );

    }

    const score =
      Math.round(

        dashboard.globalScore *

        0.50 +

        dashboard.customerSatisfaction *

        0.30 +

        dashboard.averageConfidence *

        0.20,

      );

    const grade =

      score >= 97

        ? "A+"

        : score >= 90

        ? "A"

        : score >= 80

        ? "B"

        : score >= 70

        ? "C"

        : "D";

    return {

      score,

      grade,

      strengths,

      weaknesses,

    };

  }

}
