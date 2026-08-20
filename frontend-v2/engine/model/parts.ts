import {
  PartId,
  HypothesisId,
} from "./identifiers";

import {
  Confidence,
} from "./values";

export interface Part {

  id: PartId;

  category: string;

  name: string;

  description?: string;

  hypothesisIds: HypothesisId[];

}

export interface PartRecommendation {

  primary?: Part;

  secondary: Part[];

  confidence: Confidence;

  explanation: string;

}
