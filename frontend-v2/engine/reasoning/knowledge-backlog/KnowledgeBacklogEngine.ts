import type {
  PrioritizedKnowledgeTask,
} from "../knowledge-priority/KnowledgePriorityEngine";

export interface KnowledgeSprint {

  id:
    string;

  totalHours:
    number;

  expectedConfidenceGain:
    number;

  tasks:
    PrioritizedKnowledgeTask[];

}

export class KnowledgeBacklogEngine {

  public createSprint(

    backlog:
      readonly PrioritizedKnowledgeTask[],

    maximumHours =
      40,

  ): KnowledgeSprint {

    const tasks:
      PrioritizedKnowledgeTask[] =
      [];

    let hours =
      0;

    let gain =
      0;

    for (

      const task

      of backlog

    ) {

      if (

        hours +

        task.estimatedHours >

        maximumHours

      ) {

        continue;

      }

      tasks.push(

        task,

      );

      hours +=
        task.estimatedHours;

      gain +=
        task.expectedConfidenceGain;

    }

    return {

      id:

        `SPRINT-${new Date()

          .toISOString()

          .slice(0,10)}`,

      totalHours:
        hours,

      expectedConfidenceGain:
        gain,

      tasks,

    };

  }

}
