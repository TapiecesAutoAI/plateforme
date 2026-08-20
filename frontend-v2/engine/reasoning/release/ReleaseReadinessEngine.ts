import type {
  BenchmarkResult,
} from "../benchmark/BenchmarkEngine";

import type {
  DashboardSummary,
} from "../dashboard/DiagnosticDashboardEngine";

export type ReleaseDecision =

  | "development"

  | "beta"

  | "release-candidate"

  | "production";

export interface ReleaseReadiness {

  decision:
    ReleaseDecision;

  score:
    number;

  ready:
    boolean;

  blockers:
    string[];

  recommendations:
    string[];

}

export class ReleaseReadinessEngine {

  public evaluate(

    benchmark:
      BenchmarkResult,

    dashboard:
      DashboardSummary,

  ): ReleaseReadiness {

    const blockers:
      string[] = [];

    const recommendations:
      string[] = [];

    if (

      dashboard.averageConfidence <

      90

    ) {

      blockers.push(

        "Confiance moyenne insuffisante.",

      );

    }

    if (

      dashboard.averageQuestions >

      6

    ) {

      blockers.push(

        "Trop de questions pour un particulier.",

      );

    }

    if (

      dashboard.customerSatisfaction <

      90

    ) {

      blockers.push(

        "Satisfaction client insuffisante.",

      );

    }

    if (

      dashboard.manualReviewRate >

      10

    ) {

      recommendations.push(

        "Réduire les diagnostics nécessitant une revue manuelle.",

      );

    }

    if (

      dashboard.sellRate <

      70

    ) {

      recommendations.push(

        "Améliorer le taux de diagnostic concluant.",

      );

    }

    const score =

      Math.round(

        benchmark.score *

        0.60 +

        dashboard.globalScore *

        0.40,

      );

    let decision:
      ReleaseDecision =
      "development";

    if (

      score >= 98 &&

      blockers.length === 0

    ) {

      decision =
        "production";

    }

    else if (

      score >= 94

    ) {

      decision =
        "release-candidate";

    }

    else if (

      score >= 88

    ) {

      decision =
        "beta";

    }

    return {

      decision,

      score,

      ready:
        decision ===
        "production",

      blockers,

      recommendations,

    };

  }

}
