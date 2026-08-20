import {
  DiagnosticCore,
} from "../core/DiagnosticCore";

import {
  KnowledgeDirectorEngine,
} from "../knowledge-director/KnowledgeDirectorEngine";

import {
  EnterpriseEngine,
} from "../enterprise/EnterpriseEngine";

import {
  CompetitiveMoatEngine,
} from "../moat/CompetitiveMoatEngine";

import {
  EnterpriseScoreEngine,
} from "../enterprise-score/EnterpriseScoreEngine";

import {
  InvestorEngine,
} from "../investor/InvestorEngine";

import {
  VisionEngine,
} from "../vision/VisionEngine";

export class DiagnosticKernel {

  private readonly core =
    new DiagnosticCore();

  private readonly knowledge =
    new KnowledgeDirectorEngine();

  private readonly enterprise =
    new EnterpriseEngine();

  private readonly moat =
    new CompetitiveMoatEngine();

  private readonly score =
    new EnterpriseScoreEngine();

  private readonly investor =
    new InvestorEngine();

  private readonly vision =
    new VisionEngine();

  public execute(
    input: any,
  ) {

    const core =
      this.core.execute(
        input,
      );

    return {

      core,

      enterprise:
        this.enterprise.evaluate(),

      moat:
        this.moat.evaluate(),

      score:
        this.score.evaluate(),

      investor:
        this.investor.evaluate(),

      vision:
        this.vision.analyze(),

    };

  }

}
