export interface QuestionCostResult {

  questionId:
    string;

  timeCost:
    number;

  difficultyCost:
    number;

  toolCost:
    number;

  fatigueCost:
    number;

  totalCost:
    number;

}

export interface QuestionCostQuestion {

  id:
    string;

  estimatedTimeSeconds?:
    number;

  difficulty?:
    1 | 2 | 3 | 4 | 5;

  requiresTool?:
    boolean;

}

export class QuestionCostCalculator {

  public calculate(

    question:
      QuestionCostQuestion,

    askedQuestionCount:
      number,

  ): QuestionCostResult {

    const timeCost =
      Math.max(
        5,
        question.estimatedTimeSeconds ??
        15,
      );

    const difficultyCost =
      (
        question.difficulty ??
        1
      ) * 8;

    const toolCost =
      question.requiresTool
        ? 25
        : 0;

    const fatigueCost =
      askedQuestionCount * 4;

    const totalCost =
      Number(
        (
          timeCost +
          difficultyCost +
          toolCost +
          fatigueCost
        ).toFixed(
          2,
        ),
      );

    return {

      questionId:
        question.id,

      timeCost,

      difficultyCost,

      toolCost,

      fatigueCost,

      totalCost,

    };

  }

}
