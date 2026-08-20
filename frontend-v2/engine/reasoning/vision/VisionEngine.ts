import {
  RoadmapEngine,
} from "../roadmap/RoadmapEngine";

export interface VisionMilestone {

  id:
    string;

  progress:
    number;

  completed:
    boolean;

}

export interface VisionReport {

  completion:
    number;

  remaining:
    number;

  nextPriority:
    string;

  milestones:
    VisionMilestone[];

}

export class VisionEngine {

  private readonly roadmap =
    new RoadmapEngine();

  public analyze():

    VisionReport {

    const completion =
      this.roadmap
        .completion();

    const remaining =
      100 -
      completion;

    const next =
      this.roadmap.tasks

        .filter(

          task =>

            !task.completed,

        )

        .sort(

          (

            left,

            right,

          ) =>

            right.estimatedImpact -

            left.estimatedImpact,

        )[0];

    return {

      completion,

      remaining,

      nextPriority:
        next.title,

      milestones:

        this.roadmap.tasks.map(

          task => ({

            id:
              task.id,

            progress:
              task.completed
                ? 100
                : 0,

            completed:
              task.completed,

          }),

        ),

    };

  }

}
