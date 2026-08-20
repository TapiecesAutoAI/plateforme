import {
  CompetitiveMoatEngine,
} from "../moat/CompetitiveMoatEngine";

import {
  EnterpriseEngine,
} from "../enterprise/EnterpriseEngine";

import {
  KnowledgeAssetsEngine,
} from "../assets/KnowledgeAssetsEngine";

export interface EnterpriseScore {

  globalScore:
    number;

  technology:
    number;

  data:
    number;

  ai:
    number;

  business:
    number;

  scalability:
    number;

  investorGrade:
    "A+"
    | "A"
    | "B"
    | "C";

}

export class EnterpriseScoreEngine {

  private readonly moat =
    new CompetitiveMoatEngine();

  private readonly enterprise =
    new EnterpriseEngine();

  private readonly assets =
    new KnowledgeAssetsEngine();

  public evaluate():

    EnterpriseScore {

    const moat =
      this.moat.evaluate();

    const enterprise =
      this.enterprise.evaluate();

    const assets =
      this.assets.evaluate();

    const technology =
      95;

    const data =
      Math.min(
        100,
        assets.averageStrategicScore,
      );

    const ai =
      moat.globalScore;

    const business =
      enterprise.strategicValue;

    const scalability =
      Math.round(
        (
          technology +
          data +
          ai +
          business
        ) / 4,
      );

    const globalScore =
      Math.round(
        (
          technology +
          data +
          ai +
          business +
          scalability
        ) / 5,
      );

    const investorGrade =

      globalScore >= 97
        ? "A+"
        : globalScore >= 90
        ? "A"
        : globalScore >= 80
        ? "B"
        : "C";

    return {

      globalScore,

      technology,

      data,

      ai,

      business,

      scalability,

      investorGrade,

    };

  }

}
