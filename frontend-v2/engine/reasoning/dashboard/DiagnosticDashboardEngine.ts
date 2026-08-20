import type {
  BrainMetrics,
} from "../metrics/BrainMetricsEngine";

import type {
  FeedbackStatistics,
} from "../feedback/FeedbackEngine";

import type {
  TrustScore,
} from "../trust/TrustEngine";

export interface DashboardSummary {

  globalScore:
    number;

  diagnosticQuality:
    number;

  customerSatisfaction:
    number;

  averageConfidence:
    number;

  averageTrust:
    number;

  averageQuestions:
    number;

  sellRate:
    number;

  manualReviewRate:
    number;

  recommendation:
    string;

}

export class DiagnosticDashboardEngine {

  public build(

    metrics:
      BrainMetrics,

    feedback:
      FeedbackStatistics,

    trust?:
      TrustScore,

  ): DashboardSummary {

    const diagnosticQuality =
      Math.round(

        metrics.averageConfidence *

        0.70 +

        feedback.satisfaction *

        100 *

        0.30,

      );

    const globalScore =
      Math.round(

        diagnosticQuality *

        0.60 +

        (trust?.trustScore ??
          metrics.averageTrust) *

        0.40,

      );

    let recommendation =
      "Continuer l'apprentissage.";

    if (

      globalScore >= 95

    ) {

      recommendation =
        "Prêt pour la production.";

    }

    else if (

      globalScore >= 85

    ) {

      recommendation =
        "Très bonne qualité.";

    }

    else if (

      globalScore >= 70

    ) {

      recommendation =
        "Quelques optimisations recommandées.";

    }

    return {

      globalScore,

      diagnosticQuality,

      customerSatisfaction:
        Math.round(
          feedback.satisfaction *
          100,
        ),

      averageConfidence:
        metrics.averageConfidence,

      averageTrust:
        trust?.trustScore ??
        metrics.averageTrust,

      averageQuestions:
        metrics.averageQuestions,

      sellRate:
        Math.round(
          metrics.sellRate *
          100,
        ),

      manualReviewRate:
        Math.round(
          metrics.manualReviewRate *
          100,
        ),

      recommendation,

    };

  }

}
