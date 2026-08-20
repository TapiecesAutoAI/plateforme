import {
  EnterpriseScoreEngine,
} from "../enterprise-score/EnterpriseScoreEngine";

import {
  CompetitiveMoatEngine,
} from "../moat/CompetitiveMoatEngine";

import {
  KnowledgeAssetsEngine,
} from "../assets/KnowledgeAssetsEngine";

export interface InvestorReport {

  companyScore:
    number;

  technologyScore:
    number;

  dataValue:
    number;

  competitiveMoat:
    number;

  estimatedEnterpriseValue:
    number;

  investmentLevel:
    "SEED"
    | "SERIES_A"
    | "SERIES_B"
    | "UNICORN";

}

export class InvestorEngine {

  private readonly score =
    new EnterpriseScoreEngine();

  private readonly moat =
    new CompetitiveMoatEngine();

  private readonly assets =
    new KnowledgeAssetsEngine();

  public evaluate():

    InvestorReport {

    const score =
      this.score.evaluate();

    const moat =
      this.moat.evaluate();

    const assets =
      this.assets.evaluate();

    const estimatedEnterpriseValue =
      Math.round(

        assets.totalEstimatedValue *

        (

          score.globalScore /

          100

        ) *

        (

          moat.globalScore /

          100

        ),

      );

    let investmentLevel:
      InvestorReport["investmentLevel"] =
      "SEED";

    if (

      score.globalScore >= 98 &&

      moat.globalScore >= 98

    ) {

      investmentLevel =
        "UNICORN";

    }

    else if (

      score.globalScore >= 94

    ) {

      investmentLevel =
        "SERIES_B";

    }

    else if (

      score.globalScore >= 88

    ) {

      investmentLevel =
        "SERIES_A";

    }

    return {

      companyScore:
        score.globalScore,

      technologyScore:
        score.technology,

      dataValue:
        assets.averageStrategicScore,

      competitiveMoat:
        moat.globalScore,

      estimatedEnterpriseValue,

      investmentLevel,

    };

  }

}
