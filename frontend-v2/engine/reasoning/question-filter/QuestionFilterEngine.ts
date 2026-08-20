import type {
  DiagnosticProfile,
} from "../profile/ProfileStrategyEngine";

import {
  ProfileStrategyEngine,
} from "../profile/ProfileStrategyEngine";

export interface QuestionCandidate {

  id: string;

  technicalLevel?:
    "simple"
    | "intermediate"
    | "advanced"
    | "expert";

  requiresTool?:
    boolean;

  requiresMeasurement?:
    boolean;

  estimatedTimeSeconds?:
    number;

  difficulty?:
    1 | 2 | 3 | 4 | 5;

  audiences?:
    DiagnosticProfile[];

}

export class QuestionFilterEngine {

  private readonly profile =
    new ProfileStrategyEngine();

  public filter(

    profile:
      DiagnosticProfile,

    questions:
      readonly QuestionCandidate[],

  ): QuestionCandidate[] {

    return questions.filter(

      question =>

        this.profile
          .canAskQuestion(
            profile,
            question,
          )
          .allowed,

    );

  }

}
