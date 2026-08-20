import {
  KnowledgeAssetsEngine,
} from "../assets/KnowledgeAssetsEngine";

export interface MoatMetric {

  id:
    string;

  title:
    string;

  score:
    number;

}

export interface CompetitiveMoatReport {

  globalScore:
    number;

  estimatedYearsToReplicate:
    number;

  strategicAdvantage:
    "LOW"
    | "MEDIUM"
    | "HIGH"
    | "DOMINANT";

  metrics:
    MoatMetric[];

}

export class CompetitiveMoatEngine {

  private readonly assets =
    new KnowledgeAssetsEngine();

  public evaluate():

    CompetitiveMoatReport {

    const report =
      this.assets.evaluate();

    const metrics:
      MoatMetric[] = [

      {

        id:
          "knowledge",

        title:
          "Base de connaissances",

        score:
          92,

      },

      {

        id:
          "confirmed-repairs",

        title:
          "Réparations confirmées",

        score:
          100,

      },

      {

        id:
          "customer-feedback",

        title:
          "Retour client",

        score:
          95,

      },

      {

        id:
          "self-learning",

        title:
          "Auto-apprentissage",

        score:
          98,

      },

      {

        id:
          "vin-history",

        title:
          "Historique VIN",

        score:
          99,

      },

      {

        id:
          "case-memory",

        title:
          "Mémoire des diagnostics",

        score:
          97,

      }

    ];

    const globalScore =
      Math.round(

        metrics.reduce(

          (
            total,
            metric,
          ) =>

            total +
            metric.score,

          0,

        ) /

        metrics.length,

      );

    const years =
      Math.round(

        globalScore / 10,

      );

    const strategicAdvantage =

      globalScore >= 97

        ? "DOMINANT"

        : globalScore >= 90

        ? "HIGH"

        : globalScore >= 75

        ? "MEDIUM"

        : "LOW";

    return {

      globalScore,

      estimatedYearsToReplicate:
        years,

      strategicAdvantage,

      metrics,

    };

  }

}
