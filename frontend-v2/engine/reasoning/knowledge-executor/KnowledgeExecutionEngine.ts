import type {
  KnowledgeRoadmap,
} from "../knowledge-planner/KnowledgePlannerEngine";

export interface ExecutionPhase {

  id:
    string;

  title:
    string;

  progress:
    number;

  completed:
    boolean;

}

export interface ExecutionReport {

  totalProgress:
    number;

  completedWaves:
    number;

  remainingHours:
    number;

  phases:
    ExecutionPhase[];

}

export class KnowledgeExecutionEngine {

  public evaluate(

    roadmap:
      KnowledgeRoadmap,

    completedWaveIds:
      readonly string[],

  ): ExecutionReport {

    const phases:
      ExecutionPhase[] =

      roadmap.waves.map(

        wave => {

          const completed =

            completedWaveIds.includes(

              wave.id,

            );

          return {

            id:
              wave.id,

            title:
              wave.title,

            progress:
              completed
                ? 100
                : 0,

            completed,

          };

        },

      );

    const completedHours =

      roadmap.waves

        .filter(

          wave =>

            completedWaveIds.includes(

              wave.id,

            ),

        )

        .reduce(

          (

            total,

            wave,

          ) =>

            total +

            wave.estimatedHours,

          0,

        );

    const completedWaves =

      phases.filter(

        phase =>

          phase.completed,

      ).length;

    return {

      totalProgress:

        roadmap.totalHours === 0

          ? 0

          : Math.round(

              completedHours /

              roadmap.totalHours *

              100,

            ),

      completedWaves,

      remainingHours:

        Math.max(

          0,

          roadmap.totalHours -

          completedHours,

        ),

      phases,

    };

  }

}
