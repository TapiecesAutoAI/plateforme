export interface DiagnosticCase {

  id:
    string;

  vin?:
    string;

  vehicle?:
    string;

  engine?:
    string;

  mileage?:
    number;

  questionIds:
    string[];

  evidenceIds:
    string[];

  hypothesisId:
    string;

  confidence:
    number;

  repaired:
    boolean;

  validated:
    boolean;

}

export interface SimilarCase {

  caseId:
    string;

  similarity:
    number;

  confidence:
    number;

}

export class CaseSimilarityEngine {

  private readonly cases:
    DiagnosticCase[] =
    [];

  public addCase(

    diagnosticCase:
      DiagnosticCase,

  ): void {

    this.cases.push(

      diagnosticCase,

    );

  }

  public findSimilar(

    current:
      DiagnosticCase,

    maximumResults:
      number = 20,

  ): SimilarCase[] {

    return this.cases

      .map(

        candidate => ({

          caseId:
            candidate.id,

          similarity:
            this.computeSimilarity(

              current,

              candidate,

            ),

          confidence:
            candidate.confidence,

        }),

      )

      .filter(

        candidate =>

          candidate.similarity >

          0,

      )

      .sort(

        (

          left,

          right,

        ) =>

          right.similarity -

          left.similarity ||

          right.confidence -

          left.confidence,

      )

      .slice(

        0,

        maximumResults,

      );

  }

  private computeSimilarity(

    left:
      DiagnosticCase,

    right:
      DiagnosticCase,

  ): number {

    let score =
      0;

    if (

      left.vehicle &&

      right.vehicle &&

      left.vehicle ===

      right.vehicle

    ) {

      score +=
        30;

    }

    if (

      left.engine &&

      right.engine &&

      left.engine ===

      right.engine

    ) {

      score +=
        25;

    }

    const sharedQuestions =
      left.questionIds.filter(

        id =>

          right.questionIds.includes(

            id,

          ),

      ).length;

    score +=
      sharedQuestions * 3;

    const sharedEvidence =
      left.evidenceIds.filter(

        id =>

          right.evidenceIds.includes(

            id,

          ),

      ).length;

    score +=
      sharedEvidence * 8;

    if (

      left.hypothesisId ===

      right.hypothesisId

    ) {

      score +=
        20;

    }

    if (

      left.repaired &&

      right.repaired

    ) {

      score +=
        10;

    }

    return Math.min(

      100,

      score,

    );

  }

}
