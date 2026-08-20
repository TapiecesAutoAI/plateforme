import type {
  KnowledgeGraph,
  KnowledgeNode,
} from "../knowledge-network/KnowledgeNetworkEngine";

export interface KnowledgeHealthIssue {

  nodeId:
    string;

  severity:
    "critical"
    | "high"
    | "medium"
    | "low";

  message:
    string;

}

export interface KnowledgeHealthReport {

  score:
    number;

  issues:
    KnowledgeHealthIssue[];

}

export class KnowledgeHealthEngine {

  public analyze(

    graph:
      KnowledgeGraph,

  ): KnowledgeHealthReport {

    const issues:
      KnowledgeHealthIssue[] =
      [];

    for (

      const node

      of graph.nodes

    ) {

      this.inspectNode(

        node,

        graph,

        issues,

      );

    }

    const penalty =
      issues.reduce(

        (
          total,

          issue,

        ) => {

          switch (

            issue.severity

          ) {

            case "critical":
              return total + 20;

            case "high":
              return total + 10;

            case "medium":
              return total + 5;

            default:
              return total + 2;

          }

        },

        0,

      );

    return {

      score:
        Math.max(

          0,

          100 -

          penalty,

        ),

      issues,

    };

  }

  private inspectNode(

    node:
      KnowledgeNode,

    graph:
      KnowledgeGraph,

    issues:
      KnowledgeHealthIssue[],

  ): void {

    const links =
      graph.links.filter(

        link =>

          link.from === node.id ||

          link.to === node.id,

      );

    if (

      links.length === 0

    ) {

      issues.push({

        nodeId:
          node.id,

        severity:
          "critical",

        message:
          "Nœud isolé.",

      });

      return;

    }

    if (

      links.length === 1

    ) {

      issues.push({

        nodeId:
          node.id,

        severity:
          "medium",

        message:
          "Très peu connecté.",

      });

    }

    if (

      node.type ===

      "hypothesis" &&

      links.length < 3

    ) {

      issues.push({

        nodeId:
          node.id,

        severity:
          "high",

        message:
          "Hypothèse insuffisamment documentée.",

      });

    }

  }

}
