import {
  ReasoningContext,
} from "../model";

export class ContradictionEngine {

  public evaluate(
    context: ReasoningContext,
  ): string[] {

    const contradictions:string[]=[];

    for(const evidence of context.evidences.values()){

      if(
        context.confirmedEvidenceIds.has(evidence.id) &&
        context.rejectedEvidenceIds.has(evidence.id)
      ){

        contradictions.push(evidence.id);

      }

    }

    return contradictions;

  }

}
