import type {
  Evidence,
  Hypothesis,
  ProbabilityResult,
  Question,
} from "../model";

export interface EvidenceAnalysis {

  evidence:
    Evidence;

  supportScore:
    number;

  contradictionScore:
    number;

  requirementScore:
    number;

  hypothesisCoverage:
    number;

  weightedScore:
    number;

  totalScore:
    number;

  candidateQuestions:
    Question[];

}

export class EvidenceAnalyzer {

  public analyze(

    evidences:
      readonly Evidence[],

    hypotheses:
      readonly Hypothesis[],

    questions:
      readonly Question[],

    probabilities:
      readonly ProbabilityResult[],

  ): EvidenceAnalysis[] {

    return evidences

      .filter(

        evidence =>

          evidence.status ===
            "unknown" ||

          evidence.status ===
            "uncertain",

      )

      .map(

        evidence =>

          this.compute(

            evidence,

            hypotheses,

            questions,

            probabilities,

          ),

      )

      .sort(

        (

          left,

          right,

        ) =>

          right.totalScore -

          left.totalScore,

      );

  }

  private compute(

    evidence:
      Evidence,

    hypotheses:
      readonly Hypothesis[],

    questions:
      readonly Question[],

    probabilities:
      readonly ProbabilityResult[],

  ): EvidenceAnalysis {

    let support = 0;

    let contradiction = 0;

    let requirement = 0;

    let coverage = 0;

    let weighted = 0;

    for (

      const probability

      of probabilities

    ) {

      const hypothesis =

        hypotheses.find(

          h =>

            h.id ===

            probability.hypothesis.id,

        );

      if (!hypothesis) {

        continue;

      }

      let touched = false;

      if (

        hypothesis.supportingEvidenceIds.includes(

          evidence.id,

        )

      ) {

        touched = true;

        const weight =

          hypothesis
            .supportingEvidenceWeights?.[
              evidence.id
            ] ??

          1;

        support +=

          probability.probability *
          weight;

      }

      if (

        hypothesis.contradictingEvidenceIds.includes(

          evidence.id,

        )

      ) {

        touched = true;

        const weight =

          hypothesis
            .contradictingEvidenceWeights?.[
              evidence.id
            ] ??

          1;

        contradiction +=

          probability.probability *
          weight;

      }

      if (

        hypothesis.requiredEvidenceIds.includes(

          evidence.id,

        )

      ) {

        touched = true;

        requirement +=

          probability.probability *
          2;

      }

      if (touched) {

        coverage++;

        weighted +=

          probability.probability;

      }

    }

    const linkedQuestions =

      questions.filter(

        question =>

          question.targetEvidenceIds.includes(

            evidence.id,

          ) ||

          question.options.some(

            option =>

              option.evidenceId ===

              evidence.id,

          ),

      );

    const total =

      support * 1.3 +

      contradiction * 1.5 +

      requirement * 2 +

      weighted * 3 +

      coverage;

    return {

      evidence,

      supportScore:

        Number(

          support.toFixed(

            6,

          ),

        ),

      contradictionScore:

        Number(

          contradiction.toFixed(

            6,

          ),

        ),

      requirementScore:

        Number(

          requirement.toFixed(

            6,

          ),

        ),

      hypothesisCoverage:

        coverage,

      weightedScore:

        Number(

          weighted.toFixed(

            6,

          ),

        ),

      totalScore:

        Number(

          total.toFixed(

            6,

          ),

        ),

      candidateQuestions:

        linkedQuestions,

    };

  }

}
