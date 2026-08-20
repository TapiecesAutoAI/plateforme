import { Question } from "./questions";

export interface InformationGain {

  question: Question;

  gain: number;

  expectedReduction: number;

}
