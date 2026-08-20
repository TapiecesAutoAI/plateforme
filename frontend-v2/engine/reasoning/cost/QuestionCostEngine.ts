export type QuestionCostInput = {

  profile:
    | "particulier"
    | "bricoleur"
    | "vendeur-pieces-auto"
    | "mecanicien-garage"
    | "depanneur";

  complexity:
    | "simple"
    | "intermediate"
    | "technical";

  estimatedTimeSeconds:
    number;

  requiresTool:
    boolean;

  requiresMeasurement:
    boolean;

  difficulty:
    1 | 2 | 3 | 4 | 5;

};

export interface QuestionCost {

  total: number;

  time: number;

  difficulty: number;

  tool: number;

  measurement: number;

  profile: number;

}

export class QuestionCostEngine {

  public compute(
    input: QuestionCostInput,
  ): QuestionCost {

    const time =
      Math.max(
        0,
        input.estimatedTimeSeconds / 20,
      );

    const difficulty =
      (input.difficulty - 1) * 0.8;

    const tool =
      input.requiresTool
        ? 2
        : 0;

    const measurement =
      input.requiresMeasurement
        ? 3
        : 0;

    let profile = 0;

    switch (input.profile) {

      case "particulier":

        profile +=
          input.complexity === "technical"
            ? 8
            : input.complexity === "intermediate"
              ? 3
              : 0;

        break;

      case "bricoleur":

        profile +=
          input.complexity === "technical"
            ? 2
            : 0;

        break;

      case "vendeur-pieces-auto":

        profile += 0;

        break;

      case "depanneur":

        profile +=
          time > 3
            ? 2
            : 0;

        break;

      case "mecanicien-garage":

        profile -= 1;

        break;

    }

    return {

      time,

      difficulty,

      tool,

      measurement,

      profile,

      total:
        time +
        difficulty +
        tool +
        measurement +
        profile,

    };

  }

}