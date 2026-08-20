import {
  DiagnosticBrainV1,
} from "../brain/DiagnosticBrainV1";

import {
  ProductionEngine,
} from "../production/ProductionEngine";

import {
  GovernanceEngine,
} from "../governance/GovernanceEngine";

import {
  CertificationEngine,
} from "../certification/CertificationEngine";

import {
  ReleaseReadinessEngine,
} from "../release/ReleaseReadinessEngine";

import {
  BenchmarkEngine,
} from "../benchmark/BenchmarkEngine";

import {
  DiagnosticDashboardEngine,
} from "../dashboard/DiagnosticDashboardEngine";

export class DiagnosticBrainV2 {

  private readonly brain =
    new DiagnosticBrainV1();

  private readonly dashboard =
    new DiagnosticDashboardEngine();

  private readonly benchmark =
    new BenchmarkEngine();

  private readonly release =
    new ReleaseReadinessEngine();

  private readonly certification =
    new CertificationEngine();

  private readonly governance =
    new GovernanceEngine();

  private readonly production =
    new ProductionEngine();

  public think(
    input: any,
  ) {

    const brain =
      this.brain.think(
        input,
      );

    const dashboard =
      this.dashboard.build(

        input.metrics,

        input.feedback,

        brain.trust ?? undefined,

      );

    const benchmark =
      this.benchmark.evaluate(
        dashboard,
      );

    const release =
      this.release.evaluate(

        benchmark,

        dashboard,

      );

    const certification =
      this.certification.certify(
        release,
      );

    const governance =
      this.governance.evaluate(

        certification,

        benchmark,

        dashboard,

      );

    const production =
      this.production.evaluate(

        governance,

        release,

        certification,

        dashboard,

      );

    return {

      brain,

      dashboard,

      benchmark,

      release,

      certification,

      governance,

      production,

    };

  }

}

