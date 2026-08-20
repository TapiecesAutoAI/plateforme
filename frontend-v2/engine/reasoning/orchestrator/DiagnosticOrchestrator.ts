import {
  InformationGainCalculator,
} from "../InformationGainCalculator";

import {
  QuestionCostCalculator,
} from "../QuestionCostCalculator";

import {
  DiagnosticConfidenceCalculator,
} from "../DiagnosticConfidenceCalculator";

import {
  DecisionEngineV3,
} from "../DecisionEngineV3";

import {
  HypothesisRankingEngine,
} from "../ranking/HypothesisRankingEngine";

import {
  PredictionEngine,
} from "../prediction/PredictionEngine";

import {
  ExperienceEngine,
} from "../experience/ExperienceEngine";

import {
  CaseSimilarityEngine,
  type DiagnosticCase,
} from "../cases/CaseSimilarityEngine";

export class DiagnosticOrchestrator {

  private readonly gain =
    new InformationGainCalculator();

  private readonly cost =
    new QuestionCostCalculator();

  private readonly confidence =
    new DiagnosticConfidenceCalculator();

  private readonly decision =
    new DecisionEngineV3();

  private readonly ranking =
    new HypothesisRankingEngine();

  private readonly prediction =
    new PredictionEngine();

  private readonly experience =
    new ExperienceEngine();

  private readonly similarity =
    new CaseSimilarityEngine();

  public execute(
    input: {
      question: any;
      hypotheses: any[];
      history: DiagnosticCase[];
      currentCase: DiagnosticCase;
      answeredQuestions: number;
      contradictions: number;
    },
  ) {

    const gain =
      this.gain.calculate(
        input.question,
        input.hypotheses,
      );

    const cost =
      this.cost.calculate(
        input.question,
        input.answeredQuestions,
      );

    const similar =
      this.similarity.findSimilar(
        input.currentCase,
        50,
      );

    const experience =
      this.experience.build(
        input.history,
      );

    const ranked =
      this.ranking.rank(
        input.hypotheses,
        experience,
        similar,
      );

    const prediction =
      this.prediction.predict(
        ranked,
      );

    const confidence =
      this.confidence.calculate({

        hypothesisConfidence:
          prediction.best.confidence,

        informationGain:
          gain.normalizedGain,

        contradictionCount:
          input.contradictions,

        answeredQuestions:
          input.answeredQuestions,

        similarCases:
          similar.length,

        validatedRepairs:
          experience.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.confirmedRepairs,
            0,
          ),

      });

    const decision =
      this.decision.evaluate({

        questionId:
          input.question.id,

        informationGain:
          gain.normalizedGain,

        questionCost:
          cost.totalCost,

        confidence:
          confidence.confidence,

        fatigue:
          input.answeredQuestions,

        similarCases:
          similar.length,

        validatedRepairs:
          experience.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.confirmedRepairs,
            0,
          ),

        contradictionCount:
          input.contradictions,

      });

    return {

      gain,

      cost,

      confidence,

      similar,

      experience,

      ranked,

      prediction,

      decision,

    };

  }

}
