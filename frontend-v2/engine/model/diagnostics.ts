import { Confidence } from "./values";
import { Hypothesis } from "./hypotheses";
import { PartRecommendation } from "./parts";

export interface DiagnosticResult {

  confidence: Confidence;

  hypothesis?: Hypothesis;

  alternatives: Hypothesis[];

  recommendation?: PartRecommendation;

  explanation: string;

}
