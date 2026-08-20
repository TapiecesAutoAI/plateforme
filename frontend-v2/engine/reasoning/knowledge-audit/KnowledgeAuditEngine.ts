import type {
  KnowledgeGraph,
} from "../knowledge-network/KnowledgeNetworkEngine";

export interface AuditWarning {

  id:
    string;

  severity:
    "critical"
    | "high"
    | "medium"
    | "low";

  message:
    string;

}

export interface KnowledgeAuditReport {

  score:
    number;

  warnings:
    AuditWarning[];

  duplicatedLinks:
    number;

  orphanNodes:
    number;

}

export class KnowledgeAuditEngine {

  public audit(

    graph:
      KnowledgeGraph,

  ): KnowledgeAuditReport {

    const warnings:
      AuditWarning[] =
      [];

    let duplicatedLinks =
      0;

    let orphanNodes =
      0;

    const links =
      new Set<string>();

    for (

      const link

      of graph.links

    ) {

      const key =

        `${link.from}->${link.to}`;

      if (

        links.has(
          key,
        )

      ) {

        duplicatedLinks++;

        warnings.push({

          id:
            key,

          severity:
            "medium",

          message:
            "Lien dupliqué.",

        });

      }

      links.add(
        key,
      );

    }

    for (

      const node

      of graph.nodes

    ) {

      const count =
        graph.links.filter(

          link =>

            link.from === node.id ||

            link.to === node.id,

        ).length;

      if (

        count === 0

      ) {

        orphanNodes++;

        warnings.push({

          id:
            node.id,

          severity:
            "critical",

          message:
            "Nœud orphelin.",

        });

      }

    }

    const score =
      Math.max(

        0,

        100 -

        duplicatedLinks * 2 -

        orphanNodes * 5,

      );

    return {

      score,

      warnings,

      duplicatedLinks,

      orphanNodes,

    };

  }

}
