import {
  EnterpriseEngine,
} from "../enterprise/EnterpriseEngine";

import type {
  EnterpriseReadiness,
} from "../enterprise/EnterpriseEngine";

export interface KnowledgeAsset {

  id:
    string;

  title:
    string;

  value:
    number;

  rarity:
    number;

  reproducibility:
    number;

  strategicScore:
    number;

}

export interface EnterpriseAssetsReport {

  totalEstimatedValue:
    number;

  averageStrategicScore:
    number;

  strongestAsset:
    string;

  assets:
    KnowledgeAsset[];

}

export class KnowledgeAssetsEngine {

  private readonly enterprise =
    new EnterpriseEngine();

  public evaluate():

    EnterpriseAssetsReport {

    const enterprise =
      this.enterprise.evaluate();

    const assets:
      KnowledgeAsset[] = [

      {
        id:
          "confirmed-repairs",

        title:
          "Réparations confirmées",

        value:
          100,

        rarity:
          100,

        reproducibility:
          5,

        strategicScore:
          99,

      },

      {
        id:
          "vin-history",

        title:
          "Historique VIN",

        value:
          98,

        rarity:
          95,

        reproducibility:
          10,

        strategicScore:
          96,

      },

      {
        id:
          "diagnostic-engine",

        title:
          "Moteur IA",

        value:
          90,

        rarity:
          70,

        reproducibility:
          55,

        strategicScore:
          82,

      },

      {
        id:
          "customer-feedback",

        title:
          "Retour client",

        value:
          96,

        rarity:
          90,

        reproducibility:
          20,

        strategicScore:
          94,

      },

      {
        id:
          "self-learning",

        title:
          "Auto-apprentissage",

        value:
          99,

        rarity:
          98,

        reproducibility:
          8,

        strategicScore:
          99,

      }

    ];

    return {

      totalEstimatedValue:

        enterprise.estimatedKnowledgeValue,

      averageStrategicScore:

        Math.round(

          assets.reduce(

            (
              total,

              asset,

            ) =>

              total +

              asset.strategicScore,

            0,

          ) /

          assets.length,

        ),

      strongestAsset:

        assets

          .sort(

            (
              left,

              right,

            ) =>

              right.strategicScore -

              left.strategicScore,

          )[0].title,

      assets,

    };

  }

}
