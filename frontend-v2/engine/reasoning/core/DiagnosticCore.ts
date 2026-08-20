import {
  DiagnosticBrainV2,
} from "../v2/DiagnosticBrainV2";

import {
  ChiefAIEngine,
} from "../chief-ai/ChiefAIEngine";

import {
  KnowledgeDirectorEngine,
} from "../knowledge-director/KnowledgeDirectorEngine";

import {
  EnterpriseScoreEngine,
} from "../enterprise-score/EnterpriseScoreEngine";

import {
  InvestorEngine,
} from "../investor/InvestorEngine";

export class DiagnosticCore {

  private readonly brain =
    new DiagnosticBrainV2();

  private readonly chief =
    new ChiefAIEngine();

  private readonly enterprise =
    new EnterpriseScoreEngine();

  private readonly investor =
    new InvestorEngine();

  private readonly knowledge =
    new KnowledgeDirectorEngine();

  public execute(
    input: any,
  ) {

    const brain =
      this.brain.think(
        input,
      );

    const enterprise =
      this.enterprise.evaluate();

    const investor =
      this.investor.evaluate();

    const chief =
      this.chief.evaluate(

        input.knowledge,

        brain.production,

        enterprise,

        investor,

      );

    return {

      brain,

      chief,

      enterprise,

      investor,

    };

  }

}
