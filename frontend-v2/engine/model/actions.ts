import {
  ActionId,
  QuestionId,
  TestId,
  HypothesisId,
} from "./identifiers";

export type ActionType =
  | "ASK_QUESTION"
  | "REQUEST_TEST"
  | "PROVIDE_DIAGNOSIS"
  | "STOP"
  | "SAFETY_STOP";

export interface DiagnosticAction {

  id: ActionId;

  type: ActionType;

  priority: number;

  questionId?: QuestionId;

  testId?: TestId;

  hypothesisId?: HypothesisId;

  reason: string;

}
