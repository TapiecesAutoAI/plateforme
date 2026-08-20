import type {
  KnowledgeGraph,
} from "../knowledge-network/KnowledgeNetworkEngine";

export interface GrowthSuggestion {

  target:
    string;

  priority:
    "critical"
    | "high"
    | "medium"
    | "low";

  action:
    | "new-question"
    | "new-evidence"
    | "new-hypothesis"
    | "new-part"
    | "new-rule";

  expectedImpact:
    number;

  justification:
    string;

}

export interface KnowledgeGrowthReport {

  currentCoverage:
    number;

  projectedCoverage:
    number;

  suggestions:
    GrowthSuggestion[];

}

export class KnowledgeGrowthEngine {

  public analyze(

    graph:
      KnowledgeGraph,

  ): KnowledgeGrowthReport {

    const suggestions:
      GrowthSuggestion[] =
      [];

    for (

      const node

      of graph.nodes

    ) {

      const connections =
        graph.links.filter(

          link =>

            link.from === node.id ||

            link.to === node.id,

        ).length;

      switch (

        node.type

      ) {

        case "hypothesis":

          if (

            connections < 5

          ) {

            suggestions.push({

              target:
                node.id,

              priority:
                "critical",

              action:
                "new-evidence",

              expectedImpact:
                10,

              justification:
                "Hypothèse insuffisamment documentée.",

            });

          }

          break;

        case "evidence":

          if (

            connections < 3

          ) {

            suggestions.push({

              target:
                node.id,

              priority:
                "high",

              action:
                "new-question",

              expectedImpact:
                7,

              justification:
                "Preuve peu exploitée.",

            });

          }

          break;

        case "question":

          if (

            connections < 3

          ) {

            suggestions.push({

              target:
                node.id,

              priority:
                "medium",

              action:
                "new-rule",

              expectedImpact:
                5,

              justification:
                "Question à enrichir.",

            });

          }

          break;

      }

    }

    const currentCoverage =
      Math.max(

        0,

        Math.round(

          100 -

          suggestions.length,

        ),

      );

    const projectedCoverage =
      Math.min(

        100,

        currentCoverage +

        suggestions.reduce(

          (

            total,

            suggestion,

          ) =>

            total +

            suggestion.expectedImpact,

          0,

        ) / 10,

      );

    return {

      currentCoverage,

      projectedCoverage:
        Math.round(
          projectedCoverage,
        ),

      suggestions:
        suggestions.sort(

          (

            left,

            right,

          ) =>

            right.expectedImpact -

            left.expectedImpact,

        ),

    };

  }

}
