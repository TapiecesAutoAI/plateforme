import {
  Evidence,
  Hypothesis,
  Question,
  ReasoningContext,
} from "../model";

export type EvidenceGraphNodeType =
  | "evidence"
  | "hypothesis"
  | "question";

export type EvidenceGraphEdgeType =
  | "supports"
  | "contradicts"
  | "requires"
  | "targets_evidence"
  | "targets_hypothesis";

export type EvidenceGraphNode =
  | {
      id: string;
      type: "evidence";
      value: Evidence;
    }
  | {
      id: string;
      type: "hypothesis";
      value: Hypothesis;
    }
  | {
      id: string;
      type: "question";
      value: Question;
    };

export interface EvidenceGraphEdge {

  id: string;

  type: EvidenceGraphEdgeType;

  fromId: string;

  toId: string;

  weight: number;

}

export interface EvidenceGraphPath {

  nodeIds: string[];

  edgeIds: string[];

  totalWeight: number;

}

export interface EvidenceGraphImpact {

  evidenceId: string;

  supportingHypothesisIds: string[];

  contradictingHypothesisIds: string[];

  requiredByHypothesisIds: string[];

  targetedByQuestionIds: string[];

  totalImpact: number;

}

export interface EvidenceGraphValidationIssue {

  type:
    | "missing_evidence"
    | "missing_hypothesis"
    | "orphan_evidence"
    | "orphan_hypothesis"
    | "orphan_question"
    | "duplicate_edge";

  entityId: string;

  relatedId?: string;

  message: string;

}

export interface EvidenceGraphSnapshot {

  nodes: EvidenceGraphNode[];

  edges: EvidenceGraphEdge[];

  nodeCount: number;

  edgeCount: number;

  connectedComponentCount: number;

}

/**
 * Graphe explicable reliant preuves, hypothèses et questions.
 *
 * Le graphe est construit à partir d'un ReasoningContext et reste immuable
 * après sa création. Il sert à analyser les dépendances, les impacts,
 * les chemins de raisonnement et les incohérences structurelles.
 */
export class EvidenceGraph {

  private readonly nodes =
    new Map<string, EvidenceGraphNode>();

  private readonly edges =
    new Map<string, EvidenceGraphEdge>();

  private readonly outgoing =
    new Map<string, Set<string>>();

  private readonly incoming =
    new Map<string, Set<string>>();

  private constructor() {}

  public static fromContext(
    context: ReasoningContext,
  ): EvidenceGraph {

    const graph =
      new EvidenceGraph();

    graph.addContextNodes(context);
    graph.addHypothesisEdges(context);
    graph.addQuestionEdges(context);

    return graph;

  }

  public getNode(
    id: string,
  ): EvidenceGraphNode | undefined {

    return this.nodes.get(id);

  }

  public hasNode(
    id: string,
  ): boolean {

    return this.nodes.has(id);

  }

  public getEdge(
    id: string,
  ): EvidenceGraphEdge | undefined {

    return this.edges.get(id);

  }

  public getNodes(
    type?: EvidenceGraphNodeType,
  ): EvidenceGraphNode[] {

    const result =
      [...this.nodes.values()];

    if (!type) {
      return result.sort(
        this.compareNodes,
      );
    }

    return result
      .filter(node => node.type === type)
      .sort(this.compareNodes);

  }

  public getEdges(
    type?: EvidenceGraphEdgeType,
  ): EvidenceGraphEdge[] {

    const result =
      [...this.edges.values()];

    if (!type) {
      return result.sort(
        this.compareEdges,
      );
    }

    return result
      .filter(edge => edge.type === type)
      .sort(this.compareEdges);

  }

  public getOutgoingEdges(
    nodeId: string,
    type?: EvidenceGraphEdgeType,
  ): EvidenceGraphEdge[] {

    const edgeIds =
      this.outgoing.get(nodeId);

    if (!edgeIds) {
      return [];
    }

    const edges =
      [...edgeIds]
        .map(id => this.edges.get(id))
        .filter(
          (
            edge,
          ): edge is EvidenceGraphEdge =>
            edge !== undefined,
        );

    if (!type) {
      return edges.sort(
        this.compareEdges,
      );
    }

    return edges
      .filter(edge => edge.type === type)
      .sort(this.compareEdges);

  }

  public getIncomingEdges(
    nodeId: string,
    type?: EvidenceGraphEdgeType,
  ): EvidenceGraphEdge[] {

    const edgeIds =
      this.incoming.get(nodeId);

    if (!edgeIds) {
      return [];
    }

    const edges =
      [...edgeIds]
        .map(id => this.edges.get(id))
        .filter(
          (
            edge,
          ): edge is EvidenceGraphEdge =>
            edge !== undefined,
        );

    if (!type) {
      return edges.sort(
        this.compareEdges,
      );
    }

    return edges
      .filter(edge => edge.type === type)
      .sort(this.compareEdges);

  }

  public getNeighbors(
    nodeId: string,
    direction:
      | "outgoing"
      | "incoming"
      | "both" = "both",
  ): EvidenceGraphNode[] {

    const neighborIds =
      new Set<string>();

    if (
      direction === "outgoing" ||
      direction === "both"
    ) {

      for (
        const edge
        of this.getOutgoingEdges(nodeId)
      ) {
        neighborIds.add(edge.toId);
      }

    }

    if (
      direction === "incoming" ||
      direction === "both"
    ) {

      for (
        const edge
        of this.getIncomingEdges(nodeId)
      ) {
        neighborIds.add(edge.fromId);
      }

    }

    return [...neighborIds]
      .map(id => this.nodes.get(id))
      .filter(
        (
          node,
        ): node is EvidenceGraphNode =>
          node !== undefined,
      )
      .sort(this.compareNodes);

  }

  public getSupportingEvidence(
    hypothesisId: string,
  ): Evidence[] {

    return this.getIncomingEdges(
      hypothesisId,
      "supports",
    )
      .map(edge => this.nodes.get(edge.fromId))
      .filter(
        (
          node,
        ): node is Extract<
          EvidenceGraphNode,
          { type: "evidence" }
        > =>
          node?.type === "evidence",
      )
      .map(node => node.value);

  }

  public getContradictingEvidence(
    hypothesisId: string,
  ): Evidence[] {

    return this.getIncomingEdges(
      hypothesisId,
      "contradicts",
    )
      .map(edge => this.nodes.get(edge.fromId))
      .filter(
        (
          node,
        ): node is Extract<
          EvidenceGraphNode,
          { type: "evidence" }
        > =>
          node?.type === "evidence",
      )
      .map(node => node.value);

  }

  public getRequiredEvidence(
    hypothesisId: string,
  ): Evidence[] {

    return this.getOutgoingEdges(
      hypothesisId,
      "requires",
    )
      .map(edge => this.nodes.get(edge.toId))
      .filter(
        (
          node,
        ): node is Extract<
          EvidenceGraphNode,
          { type: "evidence" }
        > =>
          node?.type === "evidence",
      )
      .map(node => node.value);

  }

  public getQuestionsForEvidence(
    evidenceId: string,
  ): Question[] {

    return this.getIncomingEdges(
      evidenceId,
      "targets_evidence",
    )
      .map(edge => this.nodes.get(edge.fromId))
      .filter(
        (
          node,
        ): node is Extract<
          EvidenceGraphNode,
          { type: "question" }
        > =>
          node?.type === "question",
      )
      .map(node => node.value);

  }

  public getQuestionsForHypothesis(
    hypothesisId: string,
  ): Question[] {

    return this.getIncomingEdges(
      hypothesisId,
      "targets_hypothesis",
    )
      .map(edge => this.nodes.get(edge.fromId))
      .filter(
        (
          node,
        ): node is Extract<
          EvidenceGraphNode,
          { type: "question" }
        > =>
          node?.type === "question",
      )
      .map(node => node.value);

  }

  public analyzeEvidenceImpact(
    evidenceId: string,
  ): EvidenceGraphImpact {

    const supportingHypothesisIds =
      this.getOutgoingEdges(
        evidenceId,
        "supports",
      ).map(edge => edge.toId);

    const contradictingHypothesisIds =
      this.getOutgoingEdges(
        evidenceId,
        "contradicts",
      ).map(edge => edge.toId);

    const requiredByHypothesisIds =
      this.getIncomingEdges(
        evidenceId,
        "requires",
      ).map(edge => edge.fromId);

    const targetedByQuestionIds =
      this.getIncomingEdges(
        evidenceId,
        "targets_evidence",
      ).map(edge => edge.fromId);

    const totalImpact =
      supportingHypothesisIds.length * 1 +
      contradictingHypothesisIds.length * 1.25 +
      requiredByHypothesisIds.length * 1.5 +
      targetedByQuestionIds.length * 0.5;

    return {

      evidenceId,

      supportingHypothesisIds:
        this.uniqueSorted(
          supportingHypothesisIds,
        ),

      contradictingHypothesisIds:
        this.uniqueSorted(
          contradictingHypothesisIds,
        ),

      requiredByHypothesisIds:
        this.uniqueSorted(
          requiredByHypothesisIds,
        ),

      targetedByQuestionIds:
        this.uniqueSorted(
          targetedByQuestionIds,
        ),

      totalImpact:
        this.round(totalImpact),

    };

  }

  public rankEvidenceByImpact():
    EvidenceGraphImpact[] {

    return this.getNodes("evidence")
      .map(node =>
        this.analyzeEvidenceImpact(
          node.id,
        ),
      )
      .sort((left, right) => {

        if (
          right.totalImpact !==
          left.totalImpact
        ) {
          return (
            right.totalImpact -
            left.totalImpact
          );
        }

        return left.evidenceId.localeCompare(
          right.evidenceId,
        );

      });

  }

  public findPaths(
    fromId: string,
    toId: string,
    maximumDepth = 6,
  ): EvidenceGraphPath[] {

    if (
      !this.nodes.has(fromId) ||
      !this.nodes.has(toId) ||
      maximumDepth < 0
    ) {
      return [];
    }

    if (fromId === toId) {

      return [{

        nodeIds: [fromId],

        edgeIds: [],

        totalWeight: 0,

      }];

    }

    const paths: EvidenceGraphPath[] = [];

    this.walkPaths(
      fromId,
      toId,
      maximumDepth,
      [fromId],
      [],
      new Set([fromId]),
      0,
      paths,
    );

    return paths.sort((left, right) => {

      if (
        left.nodeIds.length !==
        right.nodeIds.length
      ) {
        return (
          left.nodeIds.length -
          right.nodeIds.length
        );
      }

      if (
        right.totalWeight !==
        left.totalWeight
      ) {
        return (
          right.totalWeight -
          left.totalWeight
        );
      }

      return left.nodeIds
        .join("|")
        .localeCompare(
          right.nodeIds.join("|"),
        );

    });

  }

  public getConnectedComponents():
    EvidenceGraphNode[][] {

    const visited =
      new Set<string>();

    const components:
      EvidenceGraphNode[][] = [];

    for (
      const node
      of this.getNodes()
    ) {

      if (visited.has(node.id)) {
        continue;
      }

      const componentIds =
        this.collectComponent(
          node.id,
          visited,
        );

      const component =
        componentIds
          .map(id => this.nodes.get(id))
          .filter(
            (
              item,
            ): item is EvidenceGraphNode =>
              item !== undefined,
          )
          .sort(this.compareNodes);

      components.push(component);

    }

    return components.sort(
      (left, right) => {

        if (
          right.length !== left.length
        ) {
          return (
            right.length -
            left.length
          );
        }

        return (
          left[0]?.id ?? ""
        ).localeCompare(
          right[0]?.id ?? "",
        );

      },
    );

  }

  public validate():
    EvidenceGraphValidationIssue[] {

    const issues:
      EvidenceGraphValidationIssue[] = [];

    issues.push(
      ...this.validateReferences(),
    );

    issues.push(
      ...this.validateOrphans(),
    );

    issues.push(
      ...this.validateDuplicateEdges(),
    );

    return issues.sort(
      (left, right) => {

        const typeComparison =
          left.type.localeCompare(
            right.type,
          );

        if (typeComparison !== 0) {
          return typeComparison;
        }

        const entityComparison =
          left.entityId.localeCompare(
            right.entityId,
          );

        if (entityComparison !== 0) {
          return entityComparison;
        }

        return (
          left.relatedId ?? ""
        ).localeCompare(
          right.relatedId ?? "",
        );

      },
    );

  }

  public snapshot():
    EvidenceGraphSnapshot {

    const nodes =
      this.getNodes();

    const edges =
      this.getEdges();

    return {

      nodes,

      edges,

      nodeCount:
        nodes.length,

      edgeCount:
        edges.length,

      connectedComponentCount:
        this.getConnectedComponents().length,

    };

  }

  private addContextNodes(
    context: ReasoningContext,
  ): void {

    for (
      const evidence
      of context.evidences.values()
    ) {

      this.addNode({

        id: evidence.id,

        type: "evidence",

        value: evidence,

      });

    }

    for (
      const hypothesis
      of context.hypotheses.values()
    ) {

      this.addNode({

        id: hypothesis.id,

        type: "hypothesis",

        value: hypothesis,

      });

    }

    for (
      const question
      of context.questions.values()
    ) {

      this.addNode({

        id: question.id,

        type: "question",

        value: question,

      });

    }

  }

  private addHypothesisEdges(
    context: ReasoningContext,
  ): void {

    for (
      const hypothesis
      of context.hypotheses.values()
    ) {

      for (
        const evidenceId
        of hypothesis.supportingEvidenceIds
      ) {

        this.addEdge({

          type: "supports",

          fromId: evidenceId,

          toId: hypothesis.id,

          weight:
            this.evidenceWeight(
              context,
              evidenceId,
              1,
            ),

        });

      }

      for (
        const evidenceId
        of hypothesis.contradictingEvidenceIds
      ) {

        this.addEdge({

          type: "contradicts",

          fromId: evidenceId,

          toId: hypothesis.id,

          weight:
            this.evidenceWeight(
              context,
              evidenceId,
              1.15,
            ),

        });

      }

      for (
        const evidenceId
        of hypothesis.requiredEvidenceIds
      ) {

        this.addEdge({

          type: "requires",

          fromId: hypothesis.id,

          toId: evidenceId,

          weight:
            this.evidenceWeight(
              context,
              evidenceId,
              1.3,
            ),

        });

      }

    }

  }

  private addQuestionEdges(
    context: ReasoningContext,
  ): void {

    for (
      const question
      of context.questions.values()
    ) {

      const questionWeight =
        this.questionWeight(question);

      for (
        const evidenceId
        of question.targetEvidenceIds
      ) {

        this.addEdge({

          type: "targets_evidence",

          fromId: question.id,

          toId: evidenceId,

          weight:
            questionWeight,

        });

      }

      for (
        const hypothesisId
        of question.targetHypothesisIds
      ) {

        this.addEdge({

          type: "targets_hypothesis",

          fromId: question.id,

          toId: hypothesisId,

          weight:
            questionWeight,

        });

      }

    }

  }

  private addNode(
    node: EvidenceGraphNode,
  ): void {

    if (this.nodes.has(node.id)) {

      throw new Error(
        `EvidenceGraph: identifiant de nœud dupliqué "${node.id}".`,
      );

    }

    this.nodes.set(
      node.id,
      node,
    );

    this.outgoing.set(
      node.id,
      new Set(),
    );

    this.incoming.set(
      node.id,
      new Set(),
    );

  }

  private addEdge(
    edge: Omit<EvidenceGraphEdge, "id">,
  ): void {

    const id =
      this.edgeId(
        edge.type,
        edge.fromId,
        edge.toId,
      );

    if (this.edges.has(id)) {
      return;
    }

    const completeEdge:
      EvidenceGraphEdge = {

        ...edge,

        id,

        weight:
          this.round(
            Math.max(
              0,
              edge.weight,
            ),
          ),

      };

    this.edges.set(
      id,
      completeEdge,
    );

    this.ensureAdjacency(
      completeEdge.fromId,
    );

    this.ensureAdjacency(
      completeEdge.toId,
    );

    this.outgoing
      .get(completeEdge.fromId)
      ?.add(id);

    this.incoming
      .get(completeEdge.toId)
      ?.add(id);

  }

  private ensureAdjacency(
    nodeId: string,
  ): void {

    if (!this.outgoing.has(nodeId)) {
      this.outgoing.set(
        nodeId,
        new Set(),
      );
    }

    if (!this.incoming.has(nodeId)) {
      this.incoming.set(
        nodeId,
        new Set(),
      );
    }

  }

  private walkPaths(
    currentId: string,
    targetId: string,
    remainingDepth: number,
    nodeIds: string[],
    edgeIds: string[],
    visited: Set<string>,
    totalWeight: number,
    paths: EvidenceGraphPath[],
  ): void {

    if (remainingDepth === 0) {
      return;
    }

    for (
      const edge
      of this.getOutgoingEdges(currentId)
    ) {

      if (visited.has(edge.toId)) {
        continue;
      }

      const nextNodeIds = [
        ...nodeIds,
        edge.toId,
      ];

      const nextEdgeIds = [
        ...edgeIds,
        edge.id,
      ];

      const nextTotalWeight =
        totalWeight + edge.weight;

      if (edge.toId === targetId) {

        paths.push({

          nodeIds:
            nextNodeIds,

          edgeIds:
            nextEdgeIds,

          totalWeight:
            this.round(
              nextTotalWeight,
            ),

        });

        continue;
      }

      const nextVisited =
        new Set(visited);

      nextVisited.add(edge.toId);

      this.walkPaths(
        edge.toId,
        targetId,
        remainingDepth - 1,
        nextNodeIds,
        nextEdgeIds,
        nextVisited,
        nextTotalWeight,
        paths,
      );

    }

  }

  private collectComponent(
    startId: string,
    visited: Set<string>,
  ): string[] {

    const component:
      string[] = [];

    const queue:
      string[] = [startId];

    visited.add(startId);

    while (queue.length > 0) {

      const current =
        queue.shift();

      if (!current) {
        continue;
      }

      component.push(current);

      for (
        const neighbor
        of this.getNeighbors(
          current,
          "both",
        )
      ) {

        if (visited.has(neighbor.id)) {
          continue;
        }

        visited.add(neighbor.id);

        queue.push(neighbor.id);

      }

    }

    return component.sort(
      (left, right) =>
        left.localeCompare(right),
    );

  }

  private validateReferences():
    EvidenceGraphValidationIssue[] {

    const issues:
      EvidenceGraphValidationIssue[] = [];

    for (
      const edge
      of this.edges.values()
    ) {

      if (!this.nodes.has(edge.fromId)) {

        issues.push({

          type:
            edge.type ===
              "targets_hypothesis"
              ? "missing_hypothesis"
              : "missing_evidence",

          entityId:
            edge.fromId,

          relatedId:
            edge.toId,

          message:
            `Le nœud source "${edge.fromId}" de l'arête "${edge.id}" est absent.`,

        });

      }

      if (!this.nodes.has(edge.toId)) {

        const expectsHypothesis =
          edge.type === "supports" ||
          edge.type === "contradicts" ||
          edge.type ===
            "targets_hypothesis";

        issues.push({

          type:
            expectsHypothesis
              ? "missing_hypothesis"
              : "missing_evidence",

          entityId:
            edge.toId,

          relatedId:
            edge.fromId,

          message:
            `Le nœud cible "${edge.toId}" de l'arête "${edge.id}" est absent.`,

        });

      }

    }

    return issues;

  }

  private validateOrphans():
    EvidenceGraphValidationIssue[] {

    const issues:
      EvidenceGraphValidationIssue[] = [];

    for (
      const node
      of this.nodes.values()
    ) {

      const degree =
        this.getOutgoingEdges(
          node.id,
        ).length +
        this.getIncomingEdges(
          node.id,
        ).length;

      if (degree > 0) {
        continue;
      }

      switch (node.type) {

        case "evidence":

          issues.push({

            type: "orphan_evidence",

            entityId: node.id,

            message:
              `La preuve "${node.id}" n'est reliée à aucune hypothèse ni question.`,

          });

          break;

        case "hypothesis":

          issues.push({

            type: "orphan_hypothesis",

            entityId: node.id,

            message:
              `L'hypothèse "${node.id}" ne possède aucune relation de raisonnement.`,

          });

          break;

        case "question":

          issues.push({

            type: "orphan_question",

            entityId: node.id,

            message:
              `La question "${node.id}" ne cible aucune preuve ni hypothèse.`,

          });

          break;

      }

    }

    return issues;

  }

  private validateDuplicateEdges():
    EvidenceGraphValidationIssue[] {

    const issues:
      EvidenceGraphValidationIssue[] = [];

    const signatures =
      new Set<string>();

    for (
      const edge
      of this.edges.values()
    ) {

      const signature = [
        edge.type,
        edge.fromId,
        edge.toId,
      ].join("|");

      if (signatures.has(signature)) {

        issues.push({

          type: "duplicate_edge",

          entityId: edge.id,

          relatedId:
            edge.toId,

          message:
            `La relation "${signature}" est dupliquée.`,

        });

        continue;
      }

      signatures.add(signature);

    }

    return issues;

  }

  private evidenceWeight(
    context: ReasoningContext,
    evidenceId: string,
    multiplier: number,
  ): number {

    const evidence =
      context.evidences.get(evidenceId);

    const reliability =
      evidence
        ? this.normalizeUnit(
            evidence.reliability,
          )
        : 0.5;

    const statusFactor =
      evidence
        ? this.statusFactor(
            evidence.status,
          )
        : 0.75;

    return (
      (0.4 + reliability * 0.6) *
      statusFactor *
      multiplier
    );

  }

  private questionWeight(
    question: Question,
  ): number {

    const targetCount =
      question.targetEvidenceIds.length +
      question.targetHypothesisIds.length;

    const cost =
      Number.isFinite(question.cost)
        ? Math.max(0, question.cost)
        : 0;

    const reach =
      Math.min(
        1,
        targetCount / 5,
      );

    const affordability =
      1 / (1 + cost * 0.2);

    return (
      0.5 +
      reach * 0.35 +
      affordability * 0.15
    );

  }

  private statusFactor(
    status: Evidence["status"],
  ): number {

    switch (status) {

      case "confirmed":
      case "rejected":
        return 1;

      case "uncertain":
        return 0.72;

      case "unknown":
        return 0.55;

    }

  }

  private edgeId(
    type: EvidenceGraphEdgeType,
    fromId: string,
    toId: string,
  ): string {

    return [
      type,
      fromId,
      toId,
    ].join(":");

  }

  private uniqueSorted(
    values: string[],
  ): string[] {

    return [
      ...new Set(values),
    ].sort(
      (left, right) =>
        left.localeCompare(right),
    );

  }

  private normalizeUnit(
    value: number,
  ): number {

    if (!Number.isFinite(value)) {
      return 0;
    }

    const normalized =
      value > 1
        ? value / 100
        : value;

    return Math.min(
      1,
      Math.max(
        0,
        normalized,
      ),
    );

  }

  private round(
    value: number,
  ): number {

    return (
      Math.round(value * 1000) /
      1000
    );

  }

  private readonly compareNodes = (
    left: EvidenceGraphNode,
    right: EvidenceGraphNode,
  ): number => {

    const typeComparison =
      left.type.localeCompare(
        right.type,
      );

    if (typeComparison !== 0) {
      return typeComparison;
    }

    return left.id.localeCompare(
      right.id,
    );

  };

  private readonly compareEdges = (
    left: EvidenceGraphEdge,
    right: EvidenceGraphEdge,
  ): number => {

    const typeComparison =
      left.type.localeCompare(
        right.type,
      );

    if (typeComparison !== 0) {
      return typeComparison;
    }

    const fromComparison =
      left.fromId.localeCompare(
        right.fromId,
      );

    if (fromComparison !== 0) {
      return fromComparison;
    }

    return left.toId.localeCompare(
      right.toId,
    );

  };

}
