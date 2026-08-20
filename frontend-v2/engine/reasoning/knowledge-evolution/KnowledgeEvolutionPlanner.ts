import type {
  KnowledgeGraph,
} from "../knowledge-network/KnowledgeNetworkEngine";

export interface EvolutionAction {

  id:
    string;

  priority:
    "critical"
    | "high"
    | "medium"
    | "low";

  type:
    | "create-question"
    | "create-evidence"
    | "create-rule"
    | "merge"
    | "split"
    | "remove";

  target:
    string;

  reason:
    string;

}

export interface KnowledgeEvolutionReport {

  score:
    number;

  actions:
    EvolutionAction[];

}

export class KnowledgeEvolutionPlanner {

  public analyze(

    graph:
      KnowledgeGraph,

  ): KnowledgeEvolutionReport {

    const actions:
      EvolutionAction[] =
      [];

    for (

      const node

      of graph.nodes

    ) {

      const links =
        graph.links.filter(

          link =>

            link.from === node.id ||

            link.to === node.id,

        );

      if (

        links.length === 0

      ) {

        actions.push({

          id:
            node.id,

          priority:
            "critical",

          type:
            "remove",

          target:
            node.id,

          reason:
            "Élément isolé.",

        });

      }

      else if (

        node.type ===
        "hypothesis" &&

        links.length < 3

      ) {

        actions.push({

          id:
            node.id,

          priority:
            "high",

          type:
            "create-evidence",

          target:
            node.id,

          reason:
            "Ajouter des preuves.",

        });

      }

      else if (

        node.type ===
        "question" &&

        links.length < 2

      ) {

        actions.push({

          id:
            node.id,

          priority:
            "medium",

          type:
            "create-rule",

          target:
            node.id,

          reason:
            "Question insuffisamment reliée.",

        });

      }

    }

    const score =
      Math.max(

        0,

        100 -

        actions.length *

        2,

      );

    return {

      score,

      actions:
        actions.sort(

          (

            left,

            right,

          ) => {

            const order = {

              critical: 4,

              high: 3,

              medium: 2,

              low: 1,

            };

            return (

              order[right.priority] -

              order[left.priority]

            );

          },

        ),

    };

  }

}
