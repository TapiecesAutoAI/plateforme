import type {
  DiagnosticAction,
  DiagnosticActionResult,
  DiagnosticAudience,
} from "./actionTypes";

import {
  createDiagnosticSession,
  type DiagnosticHypothesis,
  type DiagnosticSession,
} from "./sessionTypes";

import {
  KnowledgeLoader,
  type KnowledgeDomain,
  type KnowledgePackage,
} from "../knowledge";

import {
  EvidenceExtractor,
  ExplanationBuilder,
  ReasoningEngine,
  type ReasoningExplanation,
  type ReasoningResult,
} from "../reasoning";

export type DiagnosticEngineStep = {
  session: DiagnosticSession;

  action: DiagnosticAction | null;

  completed: boolean;

  reasoning: ReasoningResult | null;

  explanation: ReasoningExplanation | null;
};

export class DiagnosticEngine {
  private readonly loader:
    KnowledgeLoader;

  private readonly evidenceExtractor:
    EvidenceExtractor;

  private readonly reasoningEngine:
    ReasoningEngine;

  private readonly explanationBuilder:
    ExplanationBuilder;

  constructor(
    loader =
      new KnowledgeLoader(),

    evidenceExtractor =
      new EvidenceExtractor(),

    reasoningEngine =
      new ReasoningEngine(),

    explanationBuilder =
      new ExplanationBuilder(),
  ) {
    this.loader =
      loader;

    this.evidenceExtractor =
      evidenceExtractor;

    this.reasoningEngine =
      reasoningEngine;

    this.explanationBuilder =
      explanationBuilder;
  }

  public createSession(
    sessionId: string,
    profile: DiagnosticAudience,
    domain: KnowledgeDomain,
    initialText = "",
  ): DiagnosticEngineStep {
    const session =
      createDiagnosticSession(
        sessionId,
        profile,
      );

    const knowledge =
      this.loader.loadDomain(
        domain,
      );

    session.workflowId =
      domain === "battery"
        ? "battery-discharge"
        : domain;

    session.workflowLocked =
      knowledge.workflow.locked;

    this.addExtractedEvidence(
      session,
      knowledge,
      initialText,
    );

    this.markAnsweredActionsFromEvidence(
      session,
      knowledge,
    );

    return this.getNextStep(
      session,
      knowledge,
    );
  }

  public answer(
    session: DiagnosticSession,
    domain: KnowledgeDomain,
    actionId: string,
    optionId: string,
  ): DiagnosticEngineStep {
    const knowledge =
      this.loader.loadDomain(
        domain,
      );

    const action =
      this.findAction(
        knowledge,
        actionId,
      );

    if (
      !action ||
      !action.options
    ) {
      throw new Error(
        `Action introuvable ou sans options : ${actionId}`,
      );
    }

    const option =
      action.options.find(
        (candidate) =>
          candidate.id ===
          optionId,
      );

    if (
      !option
    ) {
      throw new Error(
        `Option introuvable : ${optionId}`,
      );
    }

    const now =
      new Date().toISOString();

    for (
      const rejectedEvidenceId
      of option.rejectsEvidence ??
        []
    ) {
      session.evidence =
        session.evidence.filter(
          (item) =>
            item.id !==
            rejectedEvidenceId,
        );
    }

    for (
      const evidenceId
      of option.addsEvidence ??
        []
    ) {
      if (
        session.evidence.some(
          (item) =>
            item.id ===
            evidenceId,
        )
      ) {
        continue;
      }

      const definition =
        knowledge.evidences.find(
          (item) =>
            item.id ===
            evidenceId,
        );

      session.evidence.push({
        id:
          evidenceId,

        label:
          definition?.label ??
          evidenceId,

        source:
          "action-answer",

        confidence:
          definition
            ?.defaultConfidence ??
          0.8,

        createdAt:
          now,
      });
    }

    const result:
      DiagnosticActionResult = {
        actionId:
          action.id,

        optionId:
          option.id,

        value:
          option.value,

        completedAt:
          now,

        addedEvidenceIds: [
          ...(
            option.addsEvidence ??
            []
          ),
        ],

        rejectedEvidenceIds: [
          ...(
            option.rejectsEvidence ??
            []
          ),
        ],

        supportedHypothesisIds: [
          ...(
            option.supportsHypotheses ??
            []
          ),
        ],

        rejectedHypothesisIds: [
          ...(
            option.rejectsHypotheses ??
            []
          ),
        ],
      };

    session.actionResults.push(
      result,
    );

    if (
      !session.completedActionIds.includes(
        action.id,
      )
    ) {
      session.completedActionIds.push(
        action.id,
      );
    }

    session.currentActionId =
      null;

    session.pendingAction =
      null;

    session.updatedAt =
      now;

    return this.getNextStep(
      session,
      knowledge,
    );
  }

  private getNextStep(
    session: DiagnosticSession,
    knowledge: KnowledgePackage,
  ): DiagnosticEngineStep {
    const reasoning =
      this.reasoningEngine.reason(
        session,
        knowledge,
      );

    session.hypotheses =
      this.convertHypotheses(
        reasoning,
      );

    if (
      reasoning.confidence.decision ===
      "conclude"
    ) {
      return this.completeDiagnosis(
        session,
        knowledge,
        reasoning,
      );
    }

    const selectedAction =
      reasoning.selectedQuestion
        ?.action ??
      null;

    if (
      !selectedAction
    ) {
      session.status =
        "manual-review-required";

      session.pendingAction =
        null;

      session.currentActionId =
        null;

      session.updatedAt =
        new Date().toISOString();

      return {
        session,

        action:
          null,

        completed:
          false,

        reasoning,

        explanation:
          this.explanationBuilder.build(
            session,
            knowledge,
            reasoning,
          ),
      };
    }

    session.currentActionId =
      selectedAction.id;

    session.pendingAction =
      selectedAction;

    session.status =
      "waiting-for-user";

    session.updatedAt =
      new Date().toISOString();

    return {
      session,

      action:
        selectedAction,

      completed:
        false,

      reasoning,

      explanation:
        this.explanationBuilder.build(
          session,
          knowledge,
          reasoning,
        ),
    };
  }

  private completeDiagnosis(
    session: DiagnosticSession,
    knowledge: KnowledgePackage,
    reasoning: ReasoningResult,
  ): DiagnosticEngineStep {
    const primary =
      reasoning.confidence.primary;

    if (
      !primary ||
      primary.probability <=
        0
    ) {
      session.status =
        "manual-review-required";

      session.pendingAction =
        null;

      return {
        session,

        action:
          null,

        completed:
          false,

        reasoning,

        explanation:
          this.explanationBuilder.build(
            session,
            knowledge,
            reasoning,
          ),
      };
    }

    const definition =
      knowledge.hypotheses.find(
        (item) =>
          item.id ===
          primary.id,
      );

    session.conclusion = {
      diagnosisId:
        primary.id,

      title:
        primary.label,

      confidence:
        primary.probability,

      explanation:
        definition?.explanation ??
        "Diagnostic calculé à partir des éléments observés.",

      recommendedChecks: [
        ...(
          definition
            ?.recommendedChecks ??
          []
        ),
      ],

      possibleParts: [
        ...(
          definition
            ?.possibleParts ??
          []
        ),
      ],
    };

    session.status =
      "completed";

    session.pendingAction =
      null;

    session.currentActionId =
      null;

    session.updatedAt =
      new Date().toISOString();

    return {
      session,

      action:
        null,

      completed:
        true,

      reasoning,

      explanation:
        this.explanationBuilder.build(
          session,
          knowledge,
          reasoning,
        ),
    };
  }

  private addExtractedEvidence(
    session: DiagnosticSession,
    knowledge: KnowledgePackage,
    text: string,
  ): void {
    if (
      !text.trim()
    ) {
      return;
    }

    const extracted =
      this.evidenceExtractor.extract(
        text,
      );

    const now =
      new Date().toISOString();

    for (
      const evidence
      of extracted
    ) {
      if (
        session.evidence.some(
          (item) =>
            item.id ===
            evidence.id,
        )
      ) {
        continue;
      }

      const definition =
        knowledge.evidences.find(
          (item) =>
            item.id ===
            evidence.id,
        );

      session.evidence.push({
        id:
          evidence.id,

        label:
          definition?.label ??
          evidence.id,

        source:
          "user-text",

        confidence:
          evidence.confidence,

        createdAt:
          now,
      });
    }
  }

  private markAnsweredActionsFromEvidence(
    session: DiagnosticSession,
    knowledge: KnowledgePackage,
  ): void {
    const confirmedEvidenceIds =
      new Set(
        session.evidence.map(
          (item) =>
            item.id,
        ),
      );

    const now =
      new Date().toISOString();

    for (
      const action
      of knowledge.actions
    ) {
      const matchingOption =
        action.options?.find(
          (option) =>
            option.addsEvidence?.some(
              (evidenceId) =>
                confirmedEvidenceIds.has(
                  evidenceId,
                ),
            ),
        );

      if (
        !matchingOption
      ) {
        continue;
      }

      if (
        !session.completedActionIds.includes(
          action.id,
        )
      ) {
        session.completedActionIds.push(
          action.id,
        );
      }

      if (
        session.actionResults.some(
          (result) =>
            result.actionId ===
            action.id,
        )
      ) {
        continue;
      }

      session.actionResults.push({
        actionId:
          action.id,

        optionId:
          matchingOption.id,

        value:
          matchingOption.value,

        completedAt:
          now,

        addedEvidenceIds: [
          ...(
            matchingOption.addsEvidence ??
            []
          ),
        ],

        rejectedEvidenceIds: [
          ...(
            matchingOption.rejectsEvidence ??
            []
          ),
        ],

        supportedHypothesisIds: [
          ...(
            matchingOption.supportsHypotheses ??
            []
          ),
        ],

        rejectedHypothesisIds: [
          ...(
            matchingOption.rejectsHypotheses ??
            []
          ),
        ],
      });
    }
  }

  private convertHypotheses(
    reasoning: ReasoningResult,
  ): DiagnosticHypothesis[] {
    return reasoning.hypotheses.map(
      (hypothesis) => ({
        id:
          hypothesis.id,

        label:
          hypothesis.label,

        probability:
          hypothesis.probability,

        eliminated:
          hypothesis.probability <=
          0,

        supportingEvidenceIds:
          [],

        contradictingEvidenceIds:
          [],
      }),
    );
  }

  private findAction(
    knowledge: KnowledgePackage,
    actionId: string,
  ): DiagnosticAction | null {
    return (
      knowledge.actions.find(
        (action) =>
          action.id ===
          actionId,
      ) ?? null
    );
  }
}


