import type {
  KnowledgeSprint,
} from "../knowledge-backlog/KnowledgeBacklogEngine";

export interface DevelopmentWave {

  id:
    string;

  title:
    string;

  estimatedHours:
    number;

  expectedConfidenceGain:
    number;

  sprintIds:
    string[];

}

export interface KnowledgeRoadmap {

  totalHours:
    number;

  projectedConfidenceGain:
    number;

  waves:
    DevelopmentWave[];

}

export class KnowledgePlannerEngine {

  public build(

    sprints:
      readonly KnowledgeSprint[],

  ): KnowledgeRoadmap {

    const waves:
      DevelopmentWave[] =
      [];

    let totalHours =
      0;

    let totalGain =
      0;

    for (

      let index = 0;

      index < sprints.length;

      index += 3

    ) {

      const batch =
        sprints.slice(
          index,
          index + 3,
        );

      const hours =
        batch.reduce(

          (
            total,
            sprint,
          ) =>

            total +
            sprint.totalHours,

          0,

        );

      const gain =
        batch.reduce(

          (
            total,
            sprint,
          ) =>

            total +
            sprint.expectedConfidenceGain,

          0,

        );

      totalHours +=
        hours;

      totalGain +=
        gain;

      waves.push({

        id:
          `WAVE-${waves.length + 1}`,

        title:
          `Knowledge Wave ${waves.length + 1}`,

        estimatedHours:
          hours,

        expectedConfidenceGain:
          gain,

        sprintIds:

          batch.map(

            sprint =>

              sprint.id,

          ),

      });

    }

    return {

      totalHours,

      projectedConfidenceGain:
        totalGain,

      waves,

    };

  }

}
