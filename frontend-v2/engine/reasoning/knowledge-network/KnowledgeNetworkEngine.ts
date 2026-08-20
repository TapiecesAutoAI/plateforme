export interface KnowledgeNode {

  id:
    string;

  type:
    "symptom"
    | "evidence"
    | "question"
    | "hypothesis"
    | "part";

}

export interface KnowledgeLink {

  from:
    string;

  to:
    string;

  weight:
    number;

}

export interface KnowledgeGraph {

  nodes:
    KnowledgeNode[];

  links:
    KnowledgeLink[];

}

export class KnowledgeNetworkEngine {

  private readonly graph:
    KnowledgeGraph = {

      nodes: [],

      links: [],

    };

  public addNode(

    node:
      KnowledgeNode,

  ): void {

    if (

      this.graph.nodes.some(

        candidate =>

          candidate.id ===

          node.id,

      )

    ) {

      return;

    }

    this.graph.nodes.push(

      node,

    );

  }

  public connect(

    from:
      string,

    to:
      string,

    weight =
      1,

  ): void {

    this.graph.links.push({

      from,

      to,

      weight,

    });

  }

  public neighbours(

    id:
      string,

  ): KnowledgeNode[] {

    const ids =
      this.graph.links

        .filter(

          link =>

            link.from === id ||

            link.to === id,

        )

        .flatMap(

          link => [

            link.from,

            link.to,

          ],

        )

        .filter(

          candidate =>

            candidate !== id,

        );

    return this.graph.nodes.filter(

      node =>

        ids.includes(

          node.id,

        ),

    );

  }

  public export():

    KnowledgeGraph {

    return {

      nodes:

        [...this.graph.nodes],

      links:

        [...this.graph.links],

    };

  }

}
