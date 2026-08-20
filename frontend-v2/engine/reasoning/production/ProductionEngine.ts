import type {
  GovernanceReport,
} from "../governance/GovernanceEngine";

import type {
  ReleaseReadiness,
} from "../release/ReleaseReadinessEngine";

import type {
  CertificationResult,
} from "../certification/CertificationEngine";

import type {
  DashboardSummary,
} from "../dashboard/DiagnosticDashboardEngine";

export interface ProductionChecklist {

  engineReady:
    boolean;

  knowledgeReady:
    boolean;

  learningReady:
    boolean;

  customerReady:
    boolean;

  monitoringReady:
    boolean;

  releaseReady:
    boolean;

  finalDecision:
    "GO"
    | "NO_GO";

}

export class ProductionEngine {

  public evaluate(

    governance:
      GovernanceReport,

    release:
      ReleaseReadiness,

    certification:
      CertificationResult,

    dashboard:
      DashboardSummary,

  ): ProductionChecklist {

    const engineReady =

      dashboard.averageConfidence >=
      90 &&

      dashboard.averageQuestions <=
      6;

    const knowledgeReady =

      governance.passedRules >=
      5;

    const learningReady =

      certification.level ===
      "PLATINUM" ||

      certification.level ===
      "GOLD";

    const customerReady =

      dashboard.customerSatisfaction >=
      90;

    const monitoringReady =

      dashboard.manualReviewRate <=
      10;

    const releaseReady =

      release.ready;

    return {

      engineReady,

      knowledgeReady,

      learningReady,

      customerReady,

      monitoringReady,

      releaseReady,

      finalDecision:

        engineReady &&

        knowledgeReady &&

        learningReady &&

        customerReady &&

        monitoringReady &&

        releaseReady &&

        governance.productionReady

          ? "GO"

          : "NO_GO",

    };

  }

}
