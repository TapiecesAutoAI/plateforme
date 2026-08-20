import type {
  KnowledgeGraph,
  KnowledgeNode,
  KnowledgeLink,
} from "../knowledge-network/KnowledgeNetworkEngine";

export interface GraphStatistics {

  nodes:
    number;

  links:
    number;

  averageConnections:
    number;

  isolatedNodes:
    number;

  density:
    number;

}

export class KnowledgeGraphAnalyzer {

  public analyze(

    graph:
      KnowledgeGraph,

  ): GraphStatistics {

    const nodeCount =
      graph.nodes.length;

    const linkCount =
      graph.links.length;

    const connectionMap =
      new Map<
        string,
        number
      >();

    for (

      const node

      of graph.nodes

    ) {

      connectionMap.set(

        node.id,

        0,

      );

    }

    for (

      const link

      of graph.links

    ) {

      connectionMap.set(

        link.from,

        (

          connectionMap.get(

            link.from,

          ) ?? 0

        ) + 1,

      );

      connectionMap.set(

        link.to,

        (

          connectionMap.get(

            link.to,

          ) ?? 0

        ) + 1,

      );

    }

    const isolatedNodes =

      [...connectionMap.values()]

        .filter(

          value =>

            value === 0,

        ).length;

    const averageConnections =

      nodeCount === 0

        ? 0

        : Number(

            (

              [...connectionMap.values()]

                .reduce(

                  (

                    total,

                    value,

                  ) =>

                    total +

                    value,

                  0,

                ) /

              nodeCount

            ).toFixed(

              2,

            ),

          );

    const density =

      nodeCount < 2

        ? 0

        : Number(

            (

              linkCount /

              (

                nodeCount *

                (

                  nodeCount - 1

                )

              )

            ).toFixed(

              4,

            ),

          );

    return {

      nodes:
        nodeCount,

      links:
        linkCount,

      averageConnections,

      isolatedNodes,

      density,

    };

  }

  public findDisconnectedNodes(

    graph:
      KnowledgeGraph,

  ): KnowledgeNode[] {

    const connected =
      new Set<
        string
      >();

    for (

      const link

      of graph.links

    ) {

      connected.add(
        link.from,
      );

      connected.add(
        link.to,
      );

    }

    return graph.nodes.filter(

      node =>

        !connected.has(

          node.id,

        ),

    );

  }

  public strongestLinks(

    graph:
      KnowledgeGraph,

    maximum =
      20,

  ): KnowledgeLink[] {

    return [...graph.links]

      .sort(

        (

          left,

          right,

        ) =>

          right.weight -

          left.weight,

      )

      .slice(

        0,

        maximum,

      );

  }

}
