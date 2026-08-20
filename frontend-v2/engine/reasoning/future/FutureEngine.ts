export type FutureFeatureStatus =

  | "planned"

  | "prototype"

  | "development"

  | "testing"

  | "production";

export interface FutureFeature {

  id:
    string;

  title:
    string;

  impact:
    number;

  complexity:
    number;

  status:
    FutureFeatureStatus;

}

export class FutureEngine {

  public readonly features:
    FutureFeature[] = [

      {
        id: "VIN_HISTORY",
        title: "Historique VIN mondial",
        impact: 100,
        complexity: 95,
        status: "planned",
      },

      {
        id: "CONFIRMED_REPAIRS",
        title: "Base mondiale des réparations confirmées",
        impact: 100,
        complexity: 100,
        status: "planned",
      },

      {
        id: "AI_SELF_IMPROVEMENT",
        title: "Auto-amélioration continue",
        impact: 99,
        complexity: 90,
        status: "planned",
      },

      {
        id: "CUSTOMER_LOYALTY",
        title: "Fidélisation automatique",
        impact: 96,
        complexity: 55,
        status: "planned",
      },

      {
        id: "PREDICT_NEXT_FAILURE",
        title: "Prédiction de la prochaine panne",
        impact: 100,
        complexity: 96,
        status: "planned",
      },

      {
        id: "PART_SUCCESS_SCORE",
        title: "Indice de réussite des pièces",
        impact: 97,
        complexity: 60,
        status: "planned",
      },

      {
        id: "MECHANIC_NETWORK",
        title: "Validation par garages partenaires",
        impact: 99,
        complexity: 92,
        status: "planned",
      },

      {
        id: "LIVE_FLEET_LEARNING",
        title: "Apprentissage temps réel",
        impact: 100,
        complexity: 100,
        status: "planned",
      }

    ];

  public topFeatures(
    count = 5,
  ): FutureFeature[] {

    return [...this.features]

      .sort(
        (
          left,
          right,
        ) =>
          right.impact -
          left.impact,
      )

      .slice(
        0,
        count,
      );

  }

}
