import type {
  KnowledgeDirectorDecision,
} from "../knowledge-director/KnowledgeDirectorEngine";

import type {
  ProductionChecklist,
} from "../production/ProductionEngine";

import type {
  EnterpriseScore,
} from "../enterprise-score/EnterpriseScoreEngine";

import type {
  InvestorReport,
} from "../investor/InvestorEngine";

export interface ChiefAIReport {

  aiMaturity:
    number;

  productionReady:
    boolean;

  investmentReady:
    boolean;

  enterpriseReady:
    boolean;

  nextPriority:
    string;

  estimatedGlobalConfidence:
    number;

}

export class ChiefAIEngine {

  public evaluate(

    knowledge:
      KnowledgeDirectorDecision,

    production:
      ProductionChecklist,

    enterprise:
      EnterpriseScore,

    investor:
      InvestorReport,

  ): ChiefAIReport {

    const aiMaturity =
      Math.round(

        knowledge.globalKnowledgeScore * 0.35 +

        enterprise.globalScore * 0.30 +

        investor.companyScore * 0.20 +

        (
          production.finalDecision === "GO"
            ? 100
            : 50
        ) * 0.15,

      );

    return {

      aiMaturity,

      productionReady:
        production.finalDecision ===
        "GO",

      investmentReady:
        investor.investmentLevel !==
        "SEED",

      enterpriseReady:
        enterprise.globalScore >=
        90,

      nextPriority:
        knowledge.nextMission,

      estimatedGlobalConfidence:
        Math.min(

          100,

          Math.round(

            aiMaturity * 0.98,

          ),

        ),

    };

  }

}
