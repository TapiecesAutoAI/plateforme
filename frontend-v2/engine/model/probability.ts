import { Hypothesis } from "./hypotheses";

export interface ProbabilityResult {

  hypothesis: Hypothesis;

  probability: number;

  score: number;

  support: number;

  contradiction: number;

}
