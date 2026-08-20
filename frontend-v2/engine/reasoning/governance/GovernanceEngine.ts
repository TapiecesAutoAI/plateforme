import type {
  CertificationResult,
} from "../certification/CertificationEngine";

import type {
  BenchmarkResult,
} from "../benchmark/BenchmarkEngine";

import type {
  DashboardSummary,
} from "../dashboard/DiagnosticDashboardEngine";

export interface GovernanceRule {

  id:
    string;

  enabled:
    boolean;

  passed:
    boolean;

  message:
    string;

}

export interface GovernanceReport {

  productionReady:
    boolean;

  score:
    number;

  passedRules:
    number;

  failedRules:
    number;

  rules:
    GovernanceRule[];

}

export class GovernanceEngine {

  public evaluate(

    certification:
      CertificationResult,

    benchmark:
      BenchmarkResult,

    dashboard:
      DashboardSummary,

  ): GovernanceReport {

    const rules:
      GovernanceRule[] = [

      {

        id:
          "confidence",

        enabled:
          true,

        passed:
          dashboard.averageConfidence >=
          90,

        message:
          "Confiance moyenne ≥ 90 %",

      },

      {

        id:
          "questions",

        enabled:
          true,

        passed:
          dashboard.averageQuestions <=
          6,

        message:
          "Maximum 6 questions",

      },

      {

        id:
          "satisfaction",

        enabled:
          true,

        passed:
          dashboard.customerSatisfaction >=
          90,

        message:
          "Satisfaction ≥ 90 %",

      },

      {

        id:
          "manual-review",

        enabled:
          true,

        passed:
          dashboard.manualReviewRate <=
          10,

        message:
          "Revues manuelles ≤ 10 %",

      },

      {

        id:
          "benchmark",

        enabled:
          true,

        passed:
          benchmark.grade === "A+" ||
          benchmark.grade === "A",

        message:
          "Benchmark A ou A+",

      },

      {

        id:
          "certification",

        enabled:
          true,

        passed:
          certification.level ===
            "PLATINUM" ||
          certification.level ===
            "GOLD",

        message:
          "Certification Gold minimum",

      },

    ];

    const passed =
      rules.filter(
        rule =>
          rule.passed,
      ).length;

    const failed =
      rules.length -
      passed;

    return {

      productionReady:
        failed === 0,

      score:
        Math.round(

          passed /

          rules.length *

          100,

        ),

      passedRules:
        passed,

      failedRules:
        failed,

      rules,

    };

  }

}
