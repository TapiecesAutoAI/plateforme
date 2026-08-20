import type {
  DiagnosticSession,
} from "../core/sessionTypes";

import type {
  KnowledgePackage,
} from "../knowledge";

import type {
  ReasoningContext,
} from "../model";

import {
  ConfidenceCalculator,
  type ConfidenceResult,
} from "./ConfidenceCalculator";

import {
  DecisionEngine,
  type DecisionResult,
} from "./DecisionEngine";

import {
  EvidenceGraph,
  type EvidenceGraphSnapshot,
  type EvidenceGraphValidationIssue,
} from "./EvidenceGraph";

import {
  HypothesisScorer,
  type HypothesisScore,
} from "./HypothesisScorer";

import {
  QuestionSelector,
  type QuestionScore,
} from "./QuestionSelector";

import {
  ReasoningContextBuilder,
  type ReasoningContextBuildResult,
  type ReasoningContextSource,
  type ReasoningContextValidationIssue,
} from "./ReasoningContextBuilder";

export type ReasoningResult = {

  hypotheses:
    HypothesisScore[];

  confidence:
    ConfidenceResult;

  selectedQuestion:
    QuestionScore | null;

};

export interface ReasoningV2Result {

  context:
    ReasoningContext;

  decision:
    DecisionResult;

  graph:
    EvidenceGraph;

  graphSnapshot:
    EvidenceGraphSnapshot;

  contextIssues:
    ReasoningContextValidationIssue[];

  graphIssues:
    EvidenceGraphValidationIssue[];

}

export interface ReasoningEngineOptions {

  minimumQuestions:
    number;

  confirmationThreshold:
    number;

  conclusionThreshold:
    number;

  minimumLead:
    number;

  validateGraph:
    boolean;

}

const DEFAULT_OPTIONS:
  ReasoningEngineOptions = {

    minimumQuestions:
      2,

    confirmationThreshold:
      0.65,

    conclusionThreshold:
      0.82,

    minimumLead:
      0.20,

    validateGraph:
      true,

  };

/**
 * Façade principale du raisonnement automobile.
 *
 * Deux chemins sont maintenus :
 *
 * - reason(session, knowledge) conserve strictement l'API historique ;
 * - reasonV2(context) exécute le moteur expert déterministe V2.
 *
 * Cette séparation évite toute régression pendant la migration progressive
 * des routes et des Knowledge Packs vers engine/model.
 */
export class ReasoningEngine {

  private readonly hypothesisScorer:
    HypothesisScorer;

  private readonly questionSelector:
    QuestionSelector;

  private readonly confidenceCalculator:
    ConfidenceCalculator;

  private readonly decisionEngine:
    DecisionEngine;

  private readonly options:
    ReasoningEngineOptions;

  public constructor(
    hypothesisScorer =
      new HypothesisScorer(),

    questionSelector =
      new QuestionSelector(),

    confidenceCalculator =
      new ConfidenceCalculator(),

    decisionEngine =
      new DecisionEngine(),

    options:
      Partial<ReasoningEngineOptions> = {},
  ) {

    this.hypothesisScorer =
      hypothesisScorer;

    this.questionSelector =
      questionSelector;

    this.confidenceCalculator =
      confidenceCalculator;

    this.decisionEngine =
      decisionEngine;

    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    this.validateOptions(
      this.options,
    );

  }

  /**
   * API historique conservée pour les routes actuellement en production.
   */
  public reason(
    session:
      DiagnosticSession,

    knowledge:
      KnowledgePackage,
  ): ReasoningResult {

    const evidenceIds =
      session.evidence.map(
        evidence =>
          evidence.id,
      );

    const hypotheses =
      this.hypothesisScorer.score(
        knowledge,
        evidenceIds,
      );

    const confidence =
      this.confidenceCalculator.calculate(
        hypotheses,
        {

          completedActionCount:
            session.completedActionIds.length,

          minimumQuestions:
            this.options.minimumQuestions,

          confirmationThreshold:
            this.options.confirmationThreshold,

          conclusionThreshold:
            this.options.conclusionThreshold,

          minimumLead:
            this.options.minimumLead,

        },
      );

    const selectedQuestion =
      confidence.decision === "conclude" ||
      confidence.decision === "manual-review"
        ? null
        : this.questionSelector.select(
            knowledge,
            hypotheses,
            session.completedActionIds,
            session.profile,
            evidenceIds,
          );

    return {

      hypotheses,

      confidence,

      selectedQuestion,

    };

  }

  /**
   * Exécute le moteur V2 sur un contexte déjà construit.
   */
  public reasonV2(
    context:
      ReasoningContext,
  ): ReasoningV2Result {

    const graph =
      EvidenceGraph.fromContext(
        context,
      );

    const graphIssues =
      this.options.validateGraph
        ? graph.validate()
        : [];

    const decision =
      this.decisionEngine.decide(
        context,
      );

    return {

      context,

      decision,

      graph,

      graphSnapshot:
        graph.snapshot(),

      contextIssues:
        [],

      graphIssues,

    };

  }

  /**
   * Construit puis exécute le contexte V2 en une seule opération.
   */
  public reasonFromSource(
    source:
      ReasoningContextSource,
  ): ReasoningV2Result {

    const buildResult =
      ReasoningContextBuilder.fromSource(
        source,
      );

    return this.reasonFromBuildResult(
      buildResult,
    );

  }

  /**
   * Point d'entrée destiné aux futurs adaptateurs de session.
   */
  public reasonFromBuildResult(
    buildResult:
      ReasoningContextBuildResult,
  ): ReasoningV2Result {

    const result =
      this.reasonV2(
        buildResult.context,
      );

    return {

      ...result,

      contextIssues:
        buildResult.issues,

    };

  }

  /**
   * Retourne uniquement la décision lorsque le graphe complet n'est pas requis.
   */
  public decide(
    context:
      ReasoningContext,
  ): DecisionResult {

    return this.decisionEngine.decide(
      context,
    );

  }

  /**
   * Construit uniquement le graphe d'explication.
   */
  public buildEvidenceGraph(
    context:
      ReasoningContext,
  ): EvidenceGraph {

    return EvidenceGraph.fromContext(
      context,
    );

  }

  private validateOptions(
    options:
      ReasoningEngineOptions,
  ): void {

    if (
      !Number.isInteger(
        options.minimumQuestions,
      ) ||
      options.minimumQuestions < 0
    ) {

      throw new RangeError(
        "minimumQuestions doit être un entier positif ou nul.",
      );

    }

    this.validateUnitOption(
      "confirmationThreshold",
      options.confirmationThreshold,
    );

    this.validateUnitOption(
      "conclusionThreshold",
      options.conclusionThreshold,
    );

    this.validateUnitOption(
      "minimumLead",
      options.minimumLead,
    );

    if (
      options.confirmationThreshold >
      options.conclusionThreshold
    ) {

      throw new RangeError(
        "confirmationThreshold ne peut pas dépasser conclusionThreshold.",
      );

    }

  }

  private validateUnitOption(
    name:
      string,

    value:
      number,
  ): void {

    if (
      !Number.isFinite(value) ||
      value < 0 ||
      value > 1
    ) {

      throw new RangeError(
        `${name} doit être compris entre 0 et 1.`,
      );

    }

  }

}
