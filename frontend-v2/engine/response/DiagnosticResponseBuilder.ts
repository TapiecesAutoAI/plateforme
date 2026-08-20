import type {
  DiagnosticEngineV2Step,
} from "../core/DiagnosticEngineV2";

import type {
  PartRecommendation,
  PartRecommendationResult,
  PartRecommendationStatus,
} from "../parts";

import {
  PartRecommendationEngineV2,
} from "../parts";

import {
  KnowledgeLoader,
} from "../knowledge";

import type {
  KnowledgeDomain,
} from "../knowledge";

import type {
  ReasoningExplanation,
} from "../reasoning";

import {
  SalesEngine,
} from "../sales";

import type {
  SalesRecommendation,
} from "../sales";

import {
  buildDiagnosticAmbiguity,
  type DiagnosticAmbiguity,
} from "../reasoning/DiagnosticAmbiguity";

import {
  buildDiagnosticCoexistence,
  type DiagnosticCoexistence,
} from "../reasoning/DiagnosticCoexistence";

import {
  buildDiagnosticCausalChain,
  type DiagnosticCausalChain,
} from "../reasoning/DiagnosticCausalChain";
export interface DiagnosticApiGraphSnapshot {
  nodeCount:
    number;

  edgeCount:
    number;

  connectedComponentCount:
    number;
}

export interface DiagnosticApiResponse {
  version:
    "v2";

  completed:
    boolean;

  action:
    DiagnosticEngineV2Step["action"];

  session:
    DiagnosticEngineV2Step["session"];

  decision:
    DiagnosticEngineV2Step[
      "reasoning"
    ]["decision"];

  explanation:
    ReasoningExplanation;

  partRecommendation:
    PartRecommendationResult | null;

  salesRecommendation:
    SalesRecommendation;

  stopSuggestion:
    DiagnosticEngineV2Step[
      "stopSuggestion"
    ] | null;

  completionAdvice:
    DiagnosticEngineV2Step[
      "completionAdvice"
    ] | null;

  causalChain:
    DiagnosticCausalChain | null;
  coexistence:
    DiagnosticCoexistence | null;

  ambiguity:
    DiagnosticAmbiguity | null;

  contextIssues:
    DiagnosticEngineV2Step[
      "reasoning"
    ]["contextIssues"];

  graphIssues:
    DiagnosticEngineV2Step[
      "reasoning"
    ]["graphIssues"];

  graphSnapshot:
    DiagnosticApiGraphSnapshot;
}

export class DiagnosticResponseBuilder {
  private readonly knowledgeLoader =
    new KnowledgeLoader();

  private readonly partRecommendationEngine =
    new PartRecommendationEngineV2();

  private readonly salesEngine =
    new SalesEngine();

  public build(
    result:
      DiagnosticEngineV2Step,

    domain:
      KnowledgeDomain,
  ): DiagnosticApiResponse {
    const explanation =
      this.buildExplanation(
        result,
      );

    const partRecommendation =
      this.buildPartRecommendation(
        result,
        domain,
      );

    const salesRecommendation =
      this.salesEngine
        .createRecommendation(
          partRecommendation,
          explanation,
        );

    const causalChain =
      buildDiagnosticCausalChain(
        result.session.status,
        result.reasoning
          .decision
          .probabilities,
        result.reasoning
          .context
          .confirmedEvidenceIds,
      );
    const coexistence =
      buildDiagnosticCoexistence(
        result.session.status,
        result.reasoning
          .decision
          .probabilities,
        result.reasoning
          .context
          .confirmedEvidenceIds,
      );

    const ambiguity =
      buildDiagnosticAmbiguity(
        result.session.status,
        result.reasoning
          .decision
          .probabilities,
        result.completionAdvice ??
          null,
      );

    return {
      version:
        "v2",

      completed:
        result.completed,

      action:
        result.action,

      session:
        result.session,

      decision:
        result.reasoning.decision,

      explanation,

      partRecommendation,

      salesRecommendation,

      stopSuggestion:
        result.stopSuggestion ??
        null,

      completionAdvice:
        result.completionAdvice ??
        null,

      causalChain,

      coexistence,

      ambiguity,

      contextIssues:
        result.reasoning
          .contextIssues,

      graphIssues:
        result.reasoning
          .graphIssues,

      graphSnapshot: {
        nodeCount:
          result.reasoning
            .graphSnapshot
            .nodeCount,

        edgeCount:
          result.reasoning
            .graphSnapshot
            .edgeCount,

        connectedComponentCount:
          result.reasoning
            .graphSnapshot
            .connectedComponentCount,
      },
    };
  }

  private buildExplanation(
    result:
      DiagnosticEngineV2Step,
  ): ReasoningExplanation {
    const decision =
      result.reasoning.decision;

    const primary =
      decision.probabilities[0] ??
      null;

    const summary =
      primary
        ? `Cause la plus probable : « ${primary.hypothesis.name} » avec une confiance de ${Math.round(
            primary.probability *
              100,
          )} %.`
        : "Aucune hypothèse principale n'est suffisamment établie.";

    const supportingEvidence =
      result.session.evidence
        .map(
          evidence =>
            evidence.label,
        )
        .filter(
          (
            label,
            index,
            labels,
          ) =>
            labels.indexOf(
              label,
            ) ===
            index,
        );

    const alternativeHypotheses =
      decision.probabilities
        .slice(
          1,
          4,
        )
        .filter(
          probability =>
            probability.probability >
            0,
        )
        .map(
          probability => ({
            id:
              probability
                .hypothesis
                .id,

            label:
              probability
                .hypothesis
                .name,

            probability:
              probability
                .probability,
          }),
        );

    const selectedQuestion =
      decision.selectedQuestion;

    const selectedGain =
      selectedQuestion
        ? decision.informationGains
            .find(
              item =>
                item.question.id ===
                selectedQuestion.id,
            )
        : null;

    const selectedQuestionReason =
      selectedQuestion
        ? `Cette question a été choisie car son score d'information est de ${(
            selectedGain?.gain ??
            0
          ).toFixed(2)}.`
        : null;

    return {
      summary,

      supportingEvidence,

      alternativeHypotheses,

      selectedQuestionReason,
    };
  }

  private buildPartRecommendation(
    result:
      DiagnosticEngineV2Step,

    domain:
      KnowledgeDomain,
  ): PartRecommendationResult | null {

    const conclusion =
      result.session.conclusion;

    if (
      !conclusion ||
      conclusion.possibleParts.length ===
        0
    ) {
      return null;
    }

    const knowledge =
      this.knowledgeLoader.loadDomain(
        domain,
      );

    const profile =
      result.session.profile ===
        "bricoleur" ||
      result.session.profile ===
        "vendeur-pieces-auto" ||
      result.session.profile ===
        "mecanicien-garage" ||
      result.session.profile ===
        "depanneur"
        ? result.session.profile
        : "particulier";

    const recommendation =
      this.partRecommendationEngine.recommend(
        knowledge,
        result.reasoning,
        profile,
        result.session.vehicle.vinValidated,
      );

    return {
      status:
        recommendation.status,

      primaryPart:
        recommendation.primaryPart,

      alternatives:
        recommendation.alternatives,

      confidence:
        recommendation.confidence,

      verificationRequired:
        recommendation.verificationRequired,

      verificationMessage:
        recommendation.verificationMessage,
    };
  }


  private resolveStatus(
    confidence:
      number,
  ): PartRecommendationStatus {
    if (
      confidence >=
      0.85
    ) {
      return "recommended";
    }

    if (
      confidence >=
      0.6
    ) {
      return "verify-before-purchase";
    }

    return "insufficient-confidence";
  }

  private resolveVerificationMessage(
    status:
      PartRecommendationStatus,
  ): string | null {
    switch (
      status
    ) {
      case "recommended":
        return null;

      case "verify-before-purchase":
        return "Une vérification simple supplémentaire est recommandée avant l'achat.";

      case "insufficient-confidence":
        return "Le risque d'acheter une mauvaise pièce est encore trop élevé. L'achat n'est pas recommandé pour le moment.";

      case "no-part-required":
        return "Aucune pièce ne doit être remplacée avec les informations actuelles.";
    }
  }

  private normalizeConfidence(
    value:
      number,
  ): number {
    const normalized =
      value >
      1
        ? value /
          100
        : value;

    return Math.max(
      0,
      Math.min(
        normalized,
        0.97,
      ),
    );
  }
}
