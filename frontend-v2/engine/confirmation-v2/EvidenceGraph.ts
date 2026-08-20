import type {
  Evidence,
  EvidenceId,
  Hypothesis,
} from "../model";

export interface EvidenceNode {

  evidenceId:
    EvidenceId;

  supporting:
    string[];

  contradicting:
    string[];

  required:
    string[];

}

export class EvidenceGraph {

  public build(

    hypotheses:
      readonly Hypothesis[],

  ): Map<EvidenceId, EvidenceNode> {

    const graph =
      new Map<
        EvidenceId,
        EvidenceNode
      >();

    for (
      const hypothesis
      of hypotheses
    ) {

      this.add(
        graph,
        hypothesis.supportingEvidenceIds,
        hypothesis.id,
        "supporting",
      );

      this.add(
        graph,
        hypothesis.contradictingEvidenceIds,
        hypothesis.id,
        "contradicting",
      );

      this.add(
        graph,
        hypothesis.requiredEvidenceIds,
        hypothesis.id,
        "required",
      );

    }

    return graph;

  }

  private add(

    graph:
      Map<EvidenceId, EvidenceNode>,

    evidenceIds:
      readonly EvidenceId[],

    hypothesisId:
      string,

    field:
      keyof Pick<
        EvidenceNode,
        "supporting" |
        "contradicting" |
        "required"
      >,

  ) {

    for (
      const evidenceId
      of evidenceIds
    ) {

      let node =
        graph.get(
          evidenceId,
        );

      if (!node) {

        node = {

          evidenceId,

          supporting: [],

          contradicting: [],

          required: [],

        };

        graph.set(
          evidenceId,
          node,
        );

      }

      node[field].push(
        hypothesisId,
      );

    }

  }

}
