import type {
  DiagnosticAction as LegacyDiagnosticAction,
  DiagnosticActionResult,
  DiagnosticAudience,
} from "./actionTypes";

import {
  createDiagnosticSession,
  type DiagnosticConclusion,
  type DiagnosticEvidence as LegacyDiagnosticEvidence,
  type DiagnosticHypothesis as LegacyDiagnosticHypothesis,
  type DiagnosticSession as LegacyDiagnosticSession,
} from "./sessionTypes";

import {
  KnowledgeLoader,
  type KnowledgeDomain,
  type KnowledgePackage,
} from "../knowledge";

import {
  ReasoningEngine,
  type ReasoningV2Result,
} from "../reasoning";

import {
  ConfirmationOrchestrator,
} from "../confirmation";

import {
  ConfirmationEngineV2,
} from "../confirmation-v2";

import {
  DiagnosticCompletionAdvisor,
  type DiagnosticCompletionAdvice,
} from "../reasoning/DiagnosticCompletionAdvisor";

import {
  ProfileStrategyEngine,
  type DiagnosticProfile,
  type DiagnosticTechnicalLevel,
} from "../reasoning/profile/ProfileStrategyEngine";

import {
  FailureTreeEngine,
} from "../reasoning/failure-tree/FailureTreeEngine";

import type {
  ActionType,
  DiagnosticAction,
  Evidence,
  EvidenceSource,
  EvidenceStatus,
  Hypothesis,
  Question,
  QuestionOption
} from "../model";

import type {
  ReasoningContextSource,
} from "../reasoning/ReasoningContextBuilder";

export interface DiagnosticStopSuggestion {

  available:
    boolean;

  recommended:
    boolean;

  confidence:
    number;

  confidencePercentage:
    number;

  hypothesisId:
    string | null;

  hypothesisLabel:
    string | null;

  message:
    string;

}

export interface DiagnosticEngineV2Step {

  session:
    LegacyDiagnosticSession;

  action:
    LegacyDiagnosticAction | null;

  completed:
    boolean;

  reasoning:
    ReasoningV2Result;

  stopSuggestion?:
    DiagnosticStopSuggestion;

  completionAdvice?:
    DiagnosticCompletionAdvice;

}

export interface DiagnosticEngineV2Options {

  defaultEvidenceReliability:
    number;

  defaultHypothesisBaseScore:
    number;

  defaultHypothesisConfidence:
    number;

  conclusionThreshold:
    number;

  maximumAlternativeCount:
    number;

  maximumParticulierQuestions:
    number;

}

interface KnowledgeConversion {

  source:
    ReasoningContextSource;

  actionsByQuestionId:
    Map<string, LegacyDiagnosticAction>;

}

const DEFAULT_OPTIONS:
  DiagnosticEngineV2Options = {

    defaultEvidenceReliability:
      0.8,

    defaultHypothesisBaseScore:
      1,

    defaultHypothesisConfidence:
      0.5,

    conclusionThreshold:
      0.72,

    maximumAlternativeCount:
      3,

    maximumParticulierQuestions:
      6,

  };

/**
 * Nouveau pipeline de diagnostic.
 *
 * Il conserve les sessions et Knowledge Packs historiques comme couche
 * d'entrÃ©e, puis les convertit vers engine/model avant d'exÃ©cuter le
 * ReasoningEngine V2.
 *
 * L'ancien DiagnosticEngine reste intact pendant la migration.
 */
export class DiagnosticEngineV2 {

  private readonly loader:
    KnowledgeLoader;

  private readonly reasoningEngine:
    ReasoningEngine;

  private readonly confirmationOrchestrator:
    ConfirmationOrchestrator;

  private readonly confirmationEngineV2:
    ConfirmationEngineV2;

  private readonly completionAdvisor:
    DiagnosticCompletionAdvisor;

  private readonly profileStrategy:
    ProfileStrategyEngine;

  private readonly failureTree:
    FailureTreeEngine;

  private readonly options:
    DiagnosticEngineV2Options;

  public constructor(
    loader =
      new KnowledgeLoader(),

    reasoningEngine =
      new ReasoningEngine(),

    options:
      Partial<DiagnosticEngineV2Options> = {},
  ) {

    this.loader =
      loader;

    this.reasoningEngine =
      reasoningEngine;

    this.confirmationOrchestrator =
      new ConfirmationOrchestrator();

    this.confirmationEngineV2 =
      new ConfirmationEngineV2();

    this.profileStrategy =
      new ProfileStrategyEngine();

    this.failureTree =
      new FailureTreeEngine();

    this.completionAdvisor =
      new DiagnosticCompletionAdvisor({
        minimumAnsweredQuestions: 3,
        minimumSupportingEvidence: 2,
        offerStopProbability: 0.65,
        completeProbability: 0.92,
        offerStopLead: 0.08,
        completeLead: 0.18,
        maximumAlternatives: 3,
        estimatedSecondsPerQuestion: 15,
      });

    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    this.validateOptions(
      this.options,
    );

  }

  public createSession(
    sessionId:
      string,

    profile:
      DiagnosticAudience,

    domain:
      KnowledgeDomain,

    initialEvidenceIds:
      Iterable<string> = [],
  ): DiagnosticEngineV2Step {

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

    const now =
      new Date().toISOString();

    for (
      const evidenceId
      of initialEvidenceIds
    ) {

      this.addConfirmedEvidence(
        session,
        knowledge,
        evidenceId,
        "user-text",
        now,
      );

    }

    return this.evaluate(
      session,
      knowledge,
    );

  }

  public evaluateSession(
    session:
      LegacyDiagnosticSession,

    domain:
      KnowledgeDomain,
  ): DiagnosticEngineV2Step {

    const knowledge =
      this.loader.loadDomain(
        domain,
      );

    return this.evaluate(
      session,
      knowledge,
    );

  }

  public confirmVinCompatibility(
    session:
      LegacyDiagnosticSession,

    compatible:
      boolean,
  ): void {

    if (!session.vehicle.vin) {
      throw new Error(
        "Impossible de valider la compatibilitÃ© sans VIN.",
      );
    }

    session.vehicle.vinValidated =
      compatible;

    session.updatedAt =
      new Date().toISOString();
  }


  public answerValue(
    session:
      LegacyDiagnosticSession,

    domain:
      KnowledgeDomain,

    actionId:
      string,

    value:
      string,
  ): DiagnosticEngineV2Step {

    const knowledge =
      this.loader.loadDomain(
        domain,
      );

    const action =
      this.requireAction(
        knowledge,
        actionId,
      );

    if (
      action.type !==
      "request-vin"
    ) {
      throw new Error(
        `L'action "${actionId}" n'accepte pas de valeur libre.`,
      );
    }

    const normalizedValue =
      value
        .trim()
        .toUpperCase();

    if (
      !/^[A-HJ-NPR-Z0-9]{17}$/.test(
        normalizedValue,
      )
    ) {
      throw new Error(
        "VIN invalide.",
      );
    }

    const now =
      new Date().toISOString();

    session.vehicle.vin =
      normalizedValue;

    session.vehicle.vinValidated =
      false;

    this.recordActionResult(
      session,
      action,
      undefined,
      normalizedValue,
      [],
      [],
      [],
      [],
      now,
    );

    session.currentActionId =
      null;

    session.pendingAction =
      null;

    session.updatedAt =
      now;

    return this.evaluate(
      session,
      knowledge,
    );
  }

  public answer(
    session:
      LegacyDiagnosticSession,

    domain:
      KnowledgeDomain,

    actionId:
      string,

    optionId:
      string,
  ): DiagnosticEngineV2Step {

    const knowledge =
      this.loader.loadDomain(
        domain,
      );

    const action =
      this.requireAction(
        knowledge,
        actionId,
      );

    const option =
      action.options?.find(
        candidate =>
          candidate.id === optionId,
      );

    if (!option) {

      throw new Error(
        `Option introuvable "${optionId}" pour l'action "${actionId}".`,
      );

    }

    const now =
      new Date().toISOString();

    for (
      const evidenceId
      of option.rejectsEvidence ?? []
    ) {

      this.removeEvidence(
        session,
        evidenceId,
      );

    }

    const mutuallyExclusiveEvidenceIds =
      action.options
        ?.filter(
          candidate =>
            candidate.id !== option.id,
        )
        .flatMap(
          candidate =>
            candidate.addsEvidence ?? [],
        ) ?? [];

    for (
      const evidenceId
      of mutuallyExclusiveEvidenceIds
    ) {

      this.removeEvidence(
        session,
        evidenceId,
      );

    }

    for (
      const evidenceId
      of option.addsEvidence ?? []
    ) {

      this.addConfirmedEvidence(
        session,
        knowledge,
        evidenceId,
        "action-answer",
        now,
      );

    }

    this.recordActionResult(
      session,
      action,
      option.id,
      option.value,
      option.addsEvidence ?? [],
      [
        ...new Set([
          ...(option.rejectsEvidence ?? []),
          ...mutuallyExclusiveEvidenceIds,
        ]),
      ],
      option.supportsHypotheses ?? [],
      option.rejectsHypotheses ?? [],
      now,
    );

    const profileAwareNextActionId =
      (
        option as typeof option & {
          nextActionIdByProfile?: Partial<
            Record<
              DiagnosticProfile,
              string
            >
          >;
        }
      ).nextActionIdByProfile?.[
        session.profile as DiagnosticProfile
      ] ??
      null;

    const requestedNextActionId =
      domain === "starting"
        ? null
        : (
            profileAwareNextActionId ??
            option.nextActionId ??
            action.nextActionId ??
            null
          );

    /*
     * TRANSMISSION DIRECT NEXT-ACTION FAMILY LOCK
     *
     * Un nextActionId explicite ne doit jamais permettre
     * de traverser d'une famille de transmission vers une
     * autre après identification du type de boîte.
     *
     * Si la cible est incompatible, on remet currentActionId
     * à null. evaluate() pourra alors reprendre la sélection
     * normale parmi les actions compatibles.
     */
    if (
      requestedNextActionId &&
      domain === "transmission"
    ) {

      const requestedNextAction =
        knowledge.actions.find(
          candidate =>
            candidate.id ===
            requestedNextActionId,
        );

      session.currentActionId =
        requestedNextAction &&
        this.isTransmissionActionCompatible(
          session,
          knowledge,
          requestedNextAction,
        )
          ? requestedNextActionId
          : null;

    } else {

      session.currentActionId =
        requestedNextActionId;

    }

    session.pendingAction =
      null;

    session.updatedAt =
      now;

    return this.evaluate(
      session,
      knowledge,
    );

  }

  private evaluate(
    session:
      LegacyDiagnosticSession,

    knowledge:
      KnowledgePackage,
  ): DiagnosticEngineV2Step {

    const conversion =
      this.convertKnowledge(
        session,
        knowledge,
      );

    const reasoning =
      this.reasoningEngine
        .reasonFromSource(
          conversion.source,
        );

    this.synchronizeHypotheses(
      session,
      reasoning,
    );

    const decision =
      reasoning.decision;

    let selectedQuestion =
      decision.selectedQuestion;

    let selectedAction =
      selectedQuestion
        ? conversion.actionsByQuestionId.get(
            selectedQuestion.id,
          ) ?? null
        : null;

    if (
      session.currentActionId
    ) {
      const branchAction =
        knowledge.actions.find(
          action =>
            action.id ===
            session.currentActionId,
        ) ?? null;

      if (
        branchAction &&
        !session.completedActionIds.includes(
          branchAction.id,
        ) &&
        this.isAllowedForProfile(
          session.profile as DiagnosticProfile,
          branchAction,
        ) &&
        this.isTransmissionActionCompatible(
          session,
          knowledge,
          branchAction,
        )
      ) {
        selectedAction =
          branchAction;

        selectedQuestion =
          Array.from(
            conversion.source.questions ?? [],
          ).find(
            question =>
              question.id ===
              branchAction.id,
          ) ?? null;
      }
    }

    if (
      selectedAction &&
      (
        session.completedActionIds.includes(
          selectedAction.id,
        ) ||
        !this.isAllowedForProfile(
          session.profile as DiagnosticProfile,
          selectedAction,
        ) ||
        !this.isTransmissionActionCompatible(
          session,
          knowledge,
          selectedAction,
        )
      )
    ) {
      selectedAction =
        null;
    }

    if (
      selectedAction === null
    ) {
      selectedAction =
        this.selectNonRedundantAction(
          session,
          knowledge,
          null,
        );

      if (selectedAction) {
        selectedQuestion =
          Array.from(
            conversion.source.questions ??
            [],
          ).find(
            question =>
              question.id ===
              selectedAction?.id,
          ) ?? null;
      }
    }
    const bestInformationGain =
      decision.informationGains[0]
        ?.gain ?? 0;

    const completionAdvice =
      this.completionAdvisor.evaluate(
        reasoning.context,
        decision.probabilities,
        [],
        selectedQuestion,
        session.actionResults.length,
        bestInformationGain,
      );

    const confirmationConfirmedEvidenceIds =
      new Set(
        session.evidence.map(
          evidence =>
            evidence.id,
        ),
      );

    const confirmationRejectedEvidenceIds =
      this.collectRejectedEvidenceIds(
        session,
      );
    const confirmationAllowedActions =
      knowledge.domain === "starting"
        ? this.failureTree.filterStartingActions(
            knowledge.actions,
            {
              confirmedEvidenceIds: [
                ...confirmationConfirmedEvidenceIds,
              ],
            },
          )
        : [
            ...knowledge.actions,
          ];

    const confirmationAllowedActionIds =
      new Set(
        confirmationAllowedActions.map(
          action =>
            action.id,
        ),
      );

    const confirmationQuestions =
      Array.from(
        conversion.source.questions ??
        [],
      ).filter(
        question =>
          !reasoning.context
            .completedQuestionIds
            .has(
              question.id,
            ) &&
          confirmationAllowedActionIds.has(
            question.id,
          ) &&
          (
            conversion.actionsByQuestionId.get(
              question.id,
            ) === undefined ||
            this.isTransmissionActionCompatible(
              session,
              knowledge,
              conversion.actionsByQuestionId.get(
                question.id,
              )!,
            )
          ),
      );

    const topConfidence =
      decision.probabilities[0]
        ?.probability ?? 0;

    const hasForcedBranchAction =
      session.currentActionId !== null &&
      selectedAction !== null &&
      selectedAction.id ===
        session.currentActionId;

    const confirmationV2Result =
      this.confirmationEngineV2.evaluate(
        reasoning.context,
        confirmationQuestions,
        decision.probabilities,
      );

    console.log(
      "CONFIRMATION V2 OBSERVER",
      {
        shouldConfirm:
          confirmationV2Result.shouldConfirm,

        confidence:
          confirmationV2Result.confidence,

        selectedQuestionId:
          confirmationV2Result
            .selectedCandidate
            ?.question
            .id ??
          null,

        selectedQuestionScore:
          confirmationV2Result
            .selectedCandidate
            ?.score ??
          0,

        metrics:
          confirmationV2Result.metrics,

        ranking:
          confirmationV2Result
            .candidates
            .slice(
              0,
              10,
            )
            .map(
              (
                candidate,
                index,
              ) => ({
                rank:
                  index + 1,

                questionId:
                  candidate.question.id,

                question:
                  candidate.question.text,

                score:
                  candidate.score,

                informationGain:
                  candidate.informationGain,

                branchCompatible:
                  candidate.branchCompatible,
              }),
            ),

        reason:
          confirmationV2Result.reason,
      },
    );

    let confirmationV2Applied =
      false;

    if (
      !hasForcedBranchAction &&
      confirmationV2Result.shouldConfirm &&
      confirmationV2Result.selectedCandidate
    ) {
      const confirmationQuestion =
        confirmationV2Result
          .selectedCandidate
          .question;

      const confirmationAction =
        conversion.actionsByQuestionId.get(
          confirmationQuestion.id,
        ) ??
        null;

      if (
        confirmationAction &&
        !session.completedActionIds.includes(
          confirmationAction.id,
        ) &&
        this.isAllowedForProfile(
          session.profile as DiagnosticProfile,
          confirmationAction,
        )
      ) {
        selectedQuestion =
          confirmationQuestion;

        selectedAction =
          confirmationAction;

        confirmationV2Applied =
          true;
      }
    }

    const confirmationDecision =
      !hasForcedBranchAction &&
      !confirmationV2Applied &&
      topConfidence >= 0.70 &&
      topConfidence < 0.95
        ? this.confirmationOrchestrator.evaluate(
            reasoning.context,
            confirmationQuestions,
            decision.probabilities,
          )
        : null;

    if (
      !confirmationV2Applied &&
      confirmationDecision?.decision ===
        "confirm" &&
      confirmationDecision.selectedQuestion
    ) {
      const confirmationQuestion =
        confirmationDecision.selectedQuestion;

      const confirmationAction =
        conversion.actionsByQuestionId.get(
          confirmationQuestion.id,
        ) ??
        null;

      if (
        confirmationAction &&
        !session.completedActionIds.includes(
          confirmationAction.id,
        ) &&
        this.isAllowedForProfile(
          session.profile as DiagnosticProfile,
          confirmationAction,
        )
      ) {
        selectedQuestion =
          confirmationQuestion;

        selectedAction =
          confirmationAction;
      }
    }

    console.log(
      "CONFIRMATION ORCHESTRATOR",
      {
        decision:
          confirmationDecision?.decision ??
          (
            confirmationV2Applied
              ? "skipped-v2-priority"
              : "disabled"
          ),

        selectedQuestionId:
          confirmationDecision
            ?.selectedQuestion
            ?.id ??
          null,

        confidence:
          confirmationDecision
            ?.confirmation
            ?.confidence ??
          0,

        expectedGain:
          confirmationDecision
            ?.confirmation
            ?.gain
            ?.expectedGain ??
          0,

        reason:
          confirmationDecision?.reason ??
          (
            confirmationV2Applied
              ? "Confirmation V2 prioritaire."
              : "Confirmation dÃ©sactivÃ©e."
          ),
      },
    );
    const profile =
      session.profile as
        DiagnosticProfile;

    const profileSettings =
      this.profileStrategy.getStrategy(
        profile,
      );

    const reachedProfileLimit =
      session.actionResults.length >=
        profileSettings.maximumQuestions;
    if (
      reachedProfileLimit &&
      selectedAction
    ) {
      const selectedActionType =
        this.convertActionType(
          selectedAction,
        );

      if (
        selectedActionType ===
          "ASK_QUESTION" ||
        selectedActionType ===
          "REQUEST_TEST"
      ) {
        selectedQuestion =
          null;

        selectedAction =
          null;
      }
    }

    const stopSuggestion:
      DiagnosticStopSuggestion = {

        available:
          completionAdvice.state ===
            "offer_stop" ||
          completionAdvice.state ===
            "complete",

        recommended:
          completionAdvice.state ===
            "offer_stop" ||
          completionAdvice.state ===
            "complete",

        confidence:
          completionAdvice.confidence,

        confidencePercentage:
          completionAdvice
            .confidencePercentage,

        hypothesisId:
          completionAdvice.hypothesisId,

        hypothesisLabel:
          completionAdvice
            .hypothesisLabel,

        message:
          completionAdvice.message,

      };

    const mustContinueWithConfirmationV2 =
      confirmationV2Result.shouldConfirm &&
      confirmationV2Result.selectedCandidate !==
        null &&
      selectedAction !==
        null;

    if (
      selectedAction?.type ===
        "complete-diagnosis"
    ) {
      this.completeSession(
        session,
        knowledge,
        reasoning,
      );

      return {
        session,
        action:
          null,
        completed:
          session.status === "completed",
        reasoning,
        stopSuggestion,
        completionAdvice,
      };
    }

    const hasForcedCurrentAction =
      session.currentActionId !== null &&
      selectedAction !== null &&
      selectedAction.id ===
        session.currentActionId;

    if (
      decision.diagnostic.hypothesis &&
      !mustContinueWithConfirmationV2 &&
      !hasForcedCurrentAction &&
      (
        (
          decision.type === "conclude" &&
          decision.diagnostic.confidence >=
            this.options.conclusionThreshold
        ) ||
        (reachedProfileLimit && decision.type === "conclude") ||
        completionAdvice.state ===
          "complete"
      )
    ) {

      this.completeSession(
        session,
        knowledge,
        reasoning,
      );

      return {

        session,

        action:
          null,

        completed:
          true,

        reasoning,

      };

    }

    if (
      decision.type === "manual_review" &&
      !mustContinueWithConfirmationV2 &&
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

      };

    }

    if (!selectedAction) {

      const hasUsableHypothesis =
        decision.diagnostic.hypothesis !==
          null &&
        decision.diagnostic.confidence >
          0;

      if (
        hasUsableHypothesis &&
        decision.type === "conclude" &&
        !mustContinueWithConfirmationV2
      ) {

        this.completeSession(
          session,
          knowledge,
          reasoning,
        );

        return {

          session,

          action:
            null,

          completed:
            true,

          reasoning,

          stopSuggestion,

          completionAdvice,

        };

      }

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

        stopSuggestion,

        completionAdvice,

      };

    }

    session.status =
      "waiting-for-user";

    session.pendingAction =
      selectedAction;

    session.currentActionId =
      selectedAction.id;

    session.updatedAt =
      new Date().toISOString();

    return {

      session,

      action:
        selectedAction,

      completed:
        false,

      reasoning,

      stopSuggestion,

      completionAdvice,

    };

  }

  private createStopSuggestion(
    session:
      LegacyDiagnosticSession,

    reasoning:
      ReasoningV2Result,
  ): DiagnosticStopSuggestion {

    const probabilities =
      reasoning.decision
        .probabilities;

    const top =
      probabilities[0] ??
      null;

    const second =
      probabilities[1] ??
      null;

    if (
      !top ||
      session.profile !==
        "particulier"
    ) {

      return {

        available:
          false,

        recommended:
          false,

        confidence:
          top?.probability ??
          0,

        confidencePercentage:
          Math.round(
            (
              top?.probability ??
              0
            ) * 100,
          ),

        hypothesisId:
          top?.hypothesis.id ??
          null,

        hypothesisLabel:
          top?.hypothesis.name ??
          null,

        message:
          "",

      };

    }

    const confidence =
      this.normalizeUnit(
        top.probability,
        0,
      );

    const secondConfidence =
      this.normalizeUnit(
        second?.probability,
        0,
      );

    const lead =
      Math.max(
        0,
        confidence -
        secondConfidence,
      );

    const supportingEvidenceCount =
      top.hypothesis
        .supportingEvidenceIds
        .filter(
          evidenceId =>
            reasoning.context
              .confirmedEvidenceIds
              .has(
                evidenceId,
              ),
        )
        .length;

    const answeredQuestionCount =
      session.actionResults
        .length;

    const available =
      answeredQuestionCount >= 3 &&
      supportingEvidenceCount >= 2 &&
      confidence >= 0.65 &&
      lead >= 0.08;

    const recommended =
      available &&
      confidence >= 0.76 &&
      lead >= 0.12;

    const message =
      recommended
        ? "Nous pensons avoir probablement trouvÃ© la panne. Vous pouvez arrÃªter les questions maintenant ou continuer le diagnostic."
        : available
          ? "Une panne probable est dÃ©jÃ  identifiÃ©e. Quelques questions supplÃ©mentaires peuvent encore amÃ©liorer la fiabilitÃ© du diagnostic."
          : "";

    return {

      available,

      recommended,

      confidence,

      confidencePercentage:
        Math.round(
          confidence * 100,
        ),

      hypothesisId:
        top.hypothesis.id,

      hypothesisLabel:
        top.hypothesis.name,

      message,

    };

  }

  private selectNonRedundantAction(
    session:
      LegacyDiagnosticSession,

    knowledge:
      KnowledgePackage,

    selectedAction:
      LegacyDiagnosticAction | null,
  ): LegacyDiagnosticAction | null {

    const answeredFamilies =
      new Set<string>();

    for (
      const result
      of session.actionResults
    ) {

      const completedAction =
        knowledge.actions.find(
          action =>
            action.id ===
            result.actionId,
        );

      if (!completedAction) {
        continue;
      }

      const family =
        this.resolveQuestionFamily(
          completedAction,
        );

      if (family) {
        answeredFamilies.add(
          family,
        );
      }

    }

    const selectedFamily =
      selectedAction
        ? this.resolveQuestionFamily(
            selectedAction,
          )
        : null;

    const selectedIsRedundant =
      selectedAction !== null &&
      selectedFamily !== null &&
      answeredFamilies.has(
        selectedFamily,
      );

    if (
      selectedAction &&
      !selectedIsRedundant &&
      !session.completedActionIds.includes(
        selectedAction.id,
      ) &&
      this.isAllowedForProfile(
        session.profile as DiagnosticProfile,
        selectedAction,
      )
    ) {
      return selectedAction;
    }

    const confirmedEvidenceIds =
      new Set(
        session.evidence.map(
          evidence =>
            evidence.id,
        ),
      );

    const rejectedEvidenceIds =
      this.collectRejectedEvidenceIds(
        session,
      );

    const branchActions =
      knowledge.domain === "starting"
        ? this.failureTree.filterStartingActions(
            knowledge.actions,
            {
              confirmedEvidenceIds:
                [
                  ...confirmedEvidenceIds,
                ],
            },
          )
        : [
            ...knowledge.actions,
          ];

    const candidates =
      branchActions
        .filter(
          action =>
            action.type ===
              "ask-question" ||
            action.type ===
              "request-observation" ||
            action.type ===
              "request-measurement" ||
            action.type ===
              "recommend-test",
        )
        .filter(
          action =>
            !session.completedActionIds.includes(
              action.id,
            ),
        )        .filter(
          action =>
            this.isTransmissionActionCompatible(
              session,
              knowledge,
              action,
            ),
        )
        .filter(
          action => {

            const family =
              this.resolveQuestionFamily(
                action,
              );

            return (
              !family ||
              !answeredFamilies.has(
                family,
              )
            );

          },
        )
        .filter(
          action =>
            (
              action.requiredEvidence ??
              []
            ).every(
              evidenceId =>
                confirmedEvidenceIds.has(
                  evidenceId,
                ),
            ),
        )
        .filter(
          action =>
            !(
              action.requiredEvidence ??
              []
            ).some(
              evidenceId =>
                rejectedEvidenceIds.has(
                  evidenceId,
                ),
            ),
        )
        .filter(
          action =>
            this.actionCanAddInformation(
              action,
              confirmedEvidenceIds,
              rejectedEvidenceIds,
            ),
        )
        .filter(
          action =>
            this.isAllowedForProfile(
              session.profile as DiagnosticProfile,
              action,
            ),
        )
        .sort(
          (left, right) => {

            const diagnosticPowerDifference =
              this.getDiagnosticPower(
                right,
              ) -
              this.getDiagnosticPower(
                left,
              );

            if (
              diagnosticPowerDifference !==
              0
            ) {
              return diagnosticPowerDifference;
            }

            return (
              left.priority -
              right.priority
            );

          },
        );

    return (
      candidates[0] ??
      null
    );

  }

  private actionCanAddInformation(
    action:
      LegacyDiagnosticAction,

    confirmedEvidenceIds:
      ReadonlySet<string>,

    rejectedEvidenceIds:
      ReadonlySet<string>,
  ): boolean {

    const evidenceIds =
      new Set<string>();

    for (
      const option
      of action.options ?? []
    ) {

      for (
        const evidenceId
        of option.addsEvidence ?? []
      ) {
        evidenceIds.add(
          evidenceId,
        );
      }

      for (
        const evidenceId
        of option.rejectsEvidence ?? []
      ) {
        evidenceIds.add(
          evidenceId,
        );
      }

    }

    if (
      evidenceIds.size === 0
    ) {

      const hasHypothesisEffects =
        (action.options ?? []).some(
          option =>
            (
              option.supportsHypotheses
                ?.length ??
              0
            ) > 0 ||
            (
              option.rejectsHypotheses
                ?.length ??
              0
            ) > 0,
        );

      return hasHypothesisEffects;

    }

    for (
      const evidenceId
      of evidenceIds
    ) {

      if (
        !confirmedEvidenceIds.has(
          evidenceId,
        ) &&
        !rejectedEvidenceIds.has(
          evidenceId,
        )
      ) {
        return true;
      }

    }

    return false;

  }

  private isAllowedForProfile(
    profile:
      DiagnosticProfile,

    action:
      LegacyDiagnosticAction,
  ): boolean {

    const metadata =
      action as LegacyDiagnosticAction & {
        technicalLevel?:
          DiagnosticTechnicalLevel;

        requiresTool?:
          boolean;

        requiresMeasurement?:
          boolean;

        estimatedTimeSeconds?:
          number;

        difficulty?:
          1 | 2 | 3 | 4 | 5;

        audiences?:
          DiagnosticProfile[];

        complexity?:
          string;
      };

    const technicalLevel:
      DiagnosticTechnicalLevel =
      metadata.technicalLevel ??
      (
        metadata.complexity ===
          "technical"
          ? "advanced"
          : metadata.complexity ===
              "intermediate"
            ? "intermediate"
            : "simple"
      );

    const requiresMeasurement =
      metadata.requiresMeasurement ??
      action.type ===
        "request-measurement";

    const requiresTool =
      metadata.requiresTool ??
      (
        action.type ===
          "request-measurement" ||
        action.type ===
          "recommend-test"
      );

    return this.profileStrategy
      .canAskQuestion(
        profile,
        {
          technicalLevel,
          requiresTool,
          requiresMeasurement,
          estimatedTimeSeconds:
            metadata.estimatedTimeSeconds,
          difficulty:
            metadata.difficulty,
          audiences:
            metadata.audiences,
        },
      )
      .allowed;

  }

  private getDiagnosticPower(
    action:
      LegacyDiagnosticAction,
  ): number {

    const metadata =
      action as LegacyDiagnosticAction & {
        diagnosticPower?: number;
      };

    const explicitPower =
      metadata.diagnosticPower;

    if (
      Number.isFinite(
        explicitPower,
      )
    ) {
      return Math.min(
        100,
        Math.max(
          0,
          explicitPower as number,
        ),
      );
    }

    if (
      action.type ===
        "request-measurement"
    ) {
      return 80;
    }

    if (
      action.type ===
        "request-observation"
    ) {
      return 70;
    }

    if (
      action.type ===
        "ask-question"
    ) {
      return 60;
    }

    return 40;

  }

  private resolveTransmissionTypeFromEvidence(
    session:
      LegacyDiagnosticSession,
  ):
    | "manual"
    | "automatic"
    | "dct"
    | "cvt"
    | null {

    const ids =
      new Set(
        session.evidence.map(
          evidence =>
            evidence.id,
        ),
      );

    if (
      ids.has(
        "observation-transmission-manual",
      )
    ) {
      return "manual";
    }

    if (
      ids.has(
        "observation-transmission-automatic",
      )
    ) {
      return "automatic";
    }

    if (
      ids.has(
        "observation-transmission-dct",
      )
    ) {
      return "dct";
    }

    if (
      ids.has(
        "observation-transmission-cvt",
      )
    ) {
      return "cvt";
    }

    return null;
  }

  private resolveTransmissionHypothesisFamily(
    hypothesisId:
      string,
  ):
    | "manual"
    | "automatic"
    | "dct"
    | "cvt"
    | null {

    const id =
      hypothesisId.toLowerCase();

    /*
     * AUTOMATIC
     */
    if (
      id.startsWith(
        "problem-automatic-",
      )
    ) {
      return "automatic";
    }

    /*
     * DCT
     */
    if (
      id.startsWith(
        "problem-dct-",
      )
    ) {
      return "dct";
    }

    /*
     * CVT
     */
    if (
      id.startsWith(
        "problem-cvt-",
      )
    ) {
      return "cvt";
    }

    /*
     * MANUAL
     *
     * Ne classer ici que les hypotheses
     * explicitement propres a une boite manuelle.
     *
     * Les hypotheses generiques telles que
     * differential / bearing / leak restent null
     * tant que leur exclusivite n'est pas prouvee.
     */
    if (
      id.startsWith(
        "problem-clutch-",
      ) ||
      id.startsWith(
        "problem-manual-",
      ) ||
      id.startsWith(
        "problem-shift-linkage",
      )
    ) {
      return "manual";
    }

    return null;
  }
  private resolveTransmissionActionFamily(
    action:
      LegacyDiagnosticAction,
  ):
    | "manual"
    | "automatic"
    | "dct"
    | "cvt"
    | null {

    const id =
      action.id.toLowerCase();

    /*
     * MANUAL
     */
    if (
      id.startsWith(
        "transmission-manual-",
      ) ||
      id.startsWith(
        "transmission-clutch-",
      ) ||
      id.startsWith(
        "transmission-particulier-clutch-",
      ) ||
      id ===
        "transmission-particulier-shift-linkage" ||
      id ===
        "transmission-particulier-differential" ||
      id ===
        "transmission-input-bearing-check"
    ) {
      return "manual";
    }

    /*
     * AUTOMATIC
     */
    if (
      id.startsWith(
        "transmission-automatic-",
      ) ||
      id ===
        "transmission-particulier-automatic"
    ) {
      return "automatic";
    }

    /*
     * DCT
     */
    if (
      id.startsWith(
        "transmission-dct-",
      ) ||
      id ===
        "transmission-particulier-dct"
    ) {
      return "dct";
    }

    /*
     * CVT
     */
    if (
      id.startsWith(
        "transmission-cvt-",
      ) ||
      id ===
        "transmission-particulier-cvt"
    ) {
      return "cvt";
    }

    /*
     * Toutes les autres actions sont communes.
     */
    return null;
  }

  private isTransmissionActionCompatible(
    session:
      LegacyDiagnosticSession,

    knowledge:
      KnowledgePackage,

    action:
      LegacyDiagnosticAction,
  ): boolean {

    if (
      knowledge.domain !==
      "transmission"
    ) {
      return true;
    }

    const transmissionType =
      this.resolveTransmissionTypeFromEvidence(
        session,
      );

    if (!transmissionType) {
      return true;
    }

    const actionFamily =
      this.resolveTransmissionActionFamily(
        action,
      );

    /*
     * Action commune au domaine Transmission.
     */
    if (!actionFamily) {
      return true;
    }

    return (
      actionFamily ===
      transmissionType
    );
  }
  private resolveQuestionFamily(
    action:
      LegacyDiagnosticAction,
  ): string | null {

    const metadata =
      action as LegacyDiagnosticAction & {
        family?: string;
      };

    const explicitFamily =
      metadata.family
        ?.trim();

    if (explicitFamily) {
      return explicitFamily;
    }

    const source =
      `${action.id} ${action.text}`
        .toLowerCase()
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          "",
        );

    const families: Array<
      [string, string[]]
    > = [
      [
        "electrical-light-drop",
        [
          "phare",
          "voyant",
          "faiblissent",
          "faiblir",
          "s eteignent",
          "dim",
          "lights",
        ],
      ],
      [
        "booster-test",
        [
          "booster",
          "cables",
          "jump-start",
          "jump start",
        ],
      ],
      [
        "battery-terminals",
        [
          "borne",
          "cosse",
          "oxydation",
          "terminal",
        ],
      ],
      [
        "starter-click-pattern",
        [
          "clic",
          "click",
          "clac",
        ],
      ],
      [
        "starter-rotation",
        [
          "demarreur tourne",
          "tourne dans le vide",
          "starter spins",
        ],
      ],
      [
        "battery-age",
        [
          "age de la batterie",
          "battery age",
        ],
      ],
      [
        "battery-voltage",
        [
          "tension de la batterie",
          "battery voltage",
          "voltage batterie",
        ],
      ],
      [
        "neutral-clutch-start",
        [
          "position neutre",
          "embrayage",
          "neutral",
        ],
      ],
      [
        "dashboard-response",
        [
          "tableau de bord",
          "accessoires reagissent",
          "dashboard",
        ],
      ],
      [
        "engine-start-intent",
        [
          "signes qu il veut demarrer",
          "veut demarrer",
          "tries to start",
        ],
      ],
    ];

    for (
      const [family, terms]
      of families
    ) {

      if (
        terms.some(
          term =>
            source.includes(
              term,
            ),
        )
      ) {
        return family;
      }

    }

    return null;

  }

  private convertKnowledge(
    session:
      LegacyDiagnosticSession,

    knowledge:
      KnowledgePackage,
  ): KnowledgeConversion {

    const confirmedEvidenceIds =
      new Set(
        session.evidence.map(
          evidence => evidence.id,
        ),
      );

    const rejectedEvidenceIds =
      this.collectRejectedEvidenceIds(
        session,
      );

    const explicitlySupportedHypothesisIds =
      this.collectSupportedHypothesisIds(
        session,
      );

    const explicitlyRejectedHypothesisIds =
      this.collectRejectedHypothesisIds(
        session,
      );

    const evidences =
      knowledge.evidences.map(
        definition =>
          this.convertEvidence(
            definition.id,
            definition.defaultConfidence,
            confirmedEvidenceIds,
            rejectedEvidenceIds,
          ),
      );

    const hypotheses =
      knowledge.hypotheses.map(
        definition =>
          this.convertHypothesis(
            definition,
            knowledge,
            explicitlySupportedHypothesisIds,
          ),
      );

    const questions:
      Question[] = [];

    const actions:
      DiagnosticAction[] = [];

    const actionsByQuestionId =
      new Map<
        string,
        LegacyDiagnosticAction
      >();

    for (
      const action
      of knowledge.actions
    ) {

      const question =
        this.isAllowedForProfile(
          session.profile as DiagnosticProfile,
          action,
        )
          ? this.convertQuestion(
              action,
            )
          : null;

      if (question) {

        questions.push(
          question,
        );

        actionsByQuestionId.set(
          question.id,
          action,
        );

      }

      actions.push(
        this.convertAction(
          action,
          question,
        ),
      );

    }

    const eliminatedHypothesisIds =
      new Set<string>(
        explicitlyRejectedHypothesisIds,
      );

    const activeHypothesisIds =
      new Set<string>();

    /*
     * TRANSMISSION HYPOTHESIS FAMILY LOCK
     *
     * Une fois la famille de transmission connue,
     * une hypothese explicitement propre a une autre
     * famille ne doit plus participer au ranking.
     *
     * Les hypotheses generiques restent candidates.
     */
    const transmissionType =
      knowledge.domain ===
        "transmission"
        ? this.resolveTransmissionTypeFromEvidence(
            session,
          )
        : null;

    for (
      const hypothesis
      of hypotheses
    ) {

      if (transmissionType) {

        const hypothesisFamily =
          this.resolveTransmissionHypothesisFamily(
            hypothesis.id,
          );

        if (
          hypothesisFamily &&
          hypothesisFamily !==
            transmissionType
        ) {

          eliminatedHypothesisIds.add(
            hypothesis.id,
          );

          continue;
        }
      }

      const rejectedRequiredEvidence =
        hypothesis.requiredEvidenceIds.some(
          evidenceId =>
            rejectedEvidenceIds.has(
              evidenceId,
            ),
        );

      if (rejectedRequiredEvidence) {

        eliminatedHypothesisIds.add(
          hypothesis.id,
        );

        continue;

      }

      if (
        !eliminatedHypothesisIds.has(
          hypothesis.id,
        )
      ) {

        activeHypothesisIds.add(
          hypothesis.id,
        );

      }

    }

    return {

      source: {

        evidences,

        hypotheses,

        questions,

        actions,

        confirmedEvidenceIds,

        rejectedEvidenceIds,

        completedQuestionIds:
          new Set(
            session.completedActionIds,
          ),

        activeHypothesisIds,

        eliminatedHypothesisIds,

      },

      actionsByQuestionId,

    };

  }

  private convertEvidence(
    evidenceId:
      string,

    defaultConfidence:
      number,

    confirmedEvidenceIds:
      ReadonlySet<string>,

    rejectedEvidenceIds:
      ReadonlySet<string>,
  ): Evidence {

    const isConfirmed =
      confirmedEvidenceIds.has(
        evidenceId,
      );

    const isRejected =
      rejectedEvidenceIds.has(
        evidenceId,
      );

    const status:
      EvidenceStatus =
        isConfirmed && isRejected
          ? "uncertain"
          : isConfirmed
            ? "confirmed"
            : isRejected
              ? "rejected"
              : "unknown";

    return {

      id:
        evidenceId,

      value:
        isConfirmed
          ? true
          : isRejected
            ? false
            : null,

      status,

      reliability:
        this.normalizeUnit(
          defaultConfidence,
          this.options
            .defaultEvidenceReliability,
        ),

      source:
        this.resolveEvidenceSource(
          isConfirmed,
          isRejected,
        ),

    };

  }

  private convertHypothesis(
    definition:
      KnowledgePackage["hypotheses"][number],

    knowledge:
      KnowledgePackage,

    explicitlySupportedHypothesisIds:
      ReadonlySet<string>,
  ): Hypothesis {

    const supportingEvidenceIds:
      string[] = [];

    const contradictingEvidenceIds:
        string[] = [];

      const supportingEvidenceWeights:
        Record<string, number> = {};

      const contradictingEvidenceWeights:
        Record<string, number> = {};

      let supportWeight = 0;

    for (
      const rule
      of knowledge.rules
    ) {

      if (
        rule.hypothesisId !==
        definition.id
      ) {
        continue;
      }

      if (
        rule.effect === "support"
      ) {

        supportingEvidenceIds.push(
          rule.evidenceId,
        );

        const normalizedWeight =
            Math.max(
              0,
              rule.weight,
            );

          supportWeight +=
            normalizedWeight;

          supportingEvidenceWeights[
            rule.evidenceId
          ] =
            Math.max(
              supportingEvidenceWeights[
                rule.evidenceId
              ] ?? 0,
              normalizedWeight,
            );

      } else {

        contradictingEvidenceIds.push(
            rule.evidenceId,
          );

          contradictingEvidenceWeights[
            rule.evidenceId
          ] =
            Math.max(
              contradictingEvidenceWeights[
                rule.evidenceId
              ] ?? 0,
              Math.max(
                0,
                rule.weight,
              ),
            );

        }

    }

    const explicitlySupported =
      explicitlySupportedHypothesisIds.has(
        definition.id,
      );

    const baseScore =
      Math.max(
        0.01,
        this.options
          .defaultHypothesisBaseScore +
        supportWeight * 0.05 +
        (explicitlySupported
          ? 0.5
          : 0),
      );

    return {

      id:
        definition.id,

      domainId:
        knowledge.domain,

      name:
        definition.label,

      description:
        definition.explanation ??
        definition.label,

      severity:
        "medium",

      baseScore,

      confidence:
        this.options
          .defaultHypothesisConfidence,

      supportingEvidenceIds:
        this.unique(
          supportingEvidenceIds,
        ),

        supportingEvidenceWeights,


      contradictingEvidenceIds:
        this.unique(
          contradictingEvidenceIds,
        ),

        contradictingEvidenceWeights,

      requiredEvidenceIds:
        [],

      possiblePartIds: [
        ...definition.possibleParts,
      ],

      recommendedTestIds: [
        ...definition.recommendedChecks,
      ],

    };

  }

  private convertQuestion(
    action:
      LegacyDiagnosticAction,
  ): Question | null {

    if (
      !action.options ||
      action.options.length === 0
    ) {
      return null;
    }

    const targetEvidenceIds =
      new Set<string>();

    const targetHypothesisIds =
      new Set<string>();

    const options:
      QuestionOption[] =
        action.options.map(
          option => {

            for (
              const evidenceId
              of option.addsEvidence ?? []
            ) {
              targetEvidenceIds.add(
                evidenceId,
              );
            }

            for (
              const evidenceId
              of option.rejectsEvidence ?? []
            ) {
              targetEvidenceIds.add(
                evidenceId,
              );
            }

            for (
              const hypothesisId
              of option.supportsHypotheses ?? []
            ) {
              targetHypothesisIds.add(
                hypothesisId,
              );
            }

            for (
              const hypothesisId
              of option.rejectsHypotheses ?? []
            ) {
              targetHypothesisIds.add(
                hypothesisId,
              );
            }

            return {

              id:
                option.id,

              label:
                option.label,

              evidenceId:
                option.addsEvidence?.[0],

              value:
                option.value,

            };

          },
        );

    return {

      id:
        action.id,

      domainId:
        action.workflowId,

      text:
        action.text,

      type:
        "single_choice",

      purpose:
        action.purpose ??
        action.text,

      targetHypothesisIds: [
        ...targetHypothesisIds,
      ],

      targetEvidenceIds: [
        ...targetEvidenceIds,
      ],

      requiredEvidenceIds: [
        ...(action.requiredEvidence ?? []),
      ],

      options,

      cost:
        this.actionCost(action),

    };

  }

  private convertAction(
    action:
      LegacyDiagnosticAction,

    question:
      Question | null,
  ): DiagnosticAction {

    return {

      id:
        action.id,

      type:
        this.convertActionType(
          action,
        ),

      priority:
        action.priority,

      questionId:
        question?.id,

      hypothesisId:
        action.diagnosisId,

      reason:
        action.purpose ??
        action.text,

    };

  }

  private convertActionType(
    action:
      LegacyDiagnosticAction,
  ): ActionType {

    switch (action.type) {

      case "ask-question":
      case "request-observation":
      case "request-photo":
      case "request-video":
      case "request-obd-code":
      case "request-vin":
        return "ASK_QUESTION";

      case "request-measurement":
      case "recommend-test":
      case "show-diagram":
        return "REQUEST_TEST";

      case "complete-diagnosis":
        return "PROVIDE_DIAGNOSIS";

      case "show-warning":
        return "SAFETY_STOP";

    }

  }

  private completeSession(
    session:
      LegacyDiagnosticSession,

    knowledge:
      KnowledgePackage,

    reasoning:
      ReasoningV2Result,
  ): void {
    const diagnostic =
      reasoning.decision.diagnostic;

    const hypothesis =
      diagnostic.hypothesis;

    if (!hypothesis) {
      session.status =
        "manual-review-required";

      session.pendingAction =
        null;

      session.currentActionId =
        null;

      session.updatedAt =
        new Date().toISOString();

      return;
    }

    const definition =
      knowledge.hypotheses.find(
        item =>
          item.id === hypothesis.id,
      );

    const confirmedEvidenceIds =
      reasoning.context
        .confirmedEvidenceIds;

    const rejectedEvidenceIds =
      reasoning.context
        .rejectedEvidenceIds;

    const supportingIds =
      hypothesis
        .supportingEvidenceIds;

    const contradictingIds =
      hypothesis
        .contradictingEvidenceIds;

    const requiredIds =
      hypothesis
        .requiredEvidenceIds;

    const confirmedSupporting =
      supportingIds.filter(
        evidenceId =>
          confirmedEvidenceIds.has(
            evidenceId,
          ),
      ).length;

    const confirmedContradicting =
      contradictingIds.filter(
        evidenceId =>
          confirmedEvidenceIds.has(
            evidenceId,
          ),
      ).length;

    const confirmedRequired =
      requiredIds.filter(
        evidenceId =>
          confirmedEvidenceIds.has(
            evidenceId,
          ),
      ).length;

    const rejectedRequired =
      requiredIds.filter(
        evidenceId =>
          rejectedEvidenceIds.has(
            evidenceId,
          ),
      ).length;

    const supportCoverage =
      supportingIds.length > 0
        ? confirmedSupporting /
          supportingIds.length
        : 0;

    const contradictionCoverage =
      contradictingIds.length > 0
        ? confirmedContradicting /
          contradictingIds.length
        : 0;

    const requiredCoverage =
      requiredIds.length > 0
        ? confirmedRequired /
          requiredIds.length
        : 0;

    const rejectedRequiredCoverage =
      requiredIds.length > 0
        ? rejectedRequired /
          requiredIds.length
        : 0;

    const answeredQuestionCount =
      reasoning.context
        .completedQuestionIds
        .size;

    const confirmationCompleted =
      answeredQuestionCount >= 5;

    const evidenceAdjustment =
      supportCoverage *
        0.08 +
      requiredCoverage *
        0.08 -
      contradictionCoverage *
        0.18 -
      rejectedRequiredCoverage *
        0.25;

    const confirmationBonus =
      confirmationCompleted &&
      confirmedSupporting > 0
        ? 0.02
        : 0;

    const rawRecalculatedConfidence =
      Math.min(
        0.99,
        Math.max(
          0,
          diagnostic.confidence +
            evidenceAdjustment +
            confirmationBonus,
        ),
      );

    const starterControlCircuitConfirmed =
      confirmedEvidenceIds.has(
        "observation-starter-control-voltage-absent",
      );

    const requiresStarterControlConfirmation =
      hypothesis.id ===
        "problem-starter-control-circuit" &&
      !starterControlCircuitConfirmed;

    const recalculatedConfidence =
      requiresStarterControlConfirmation
        ? Math.min(
            rawRecalculatedConfidence,
            0.85,
          )
        : rawRecalculatedConfidence;

    const conclusion:
      DiagnosticConclusion = {
        diagnosisId:
          hypothesis.id,

        title:
          hypothesis.name,

        confidence:
          Number(
            recalculatedConfidence.toFixed(
              6,
            ),
          ),

        explanation:
          diagnostic.explanation,

        recommendedChecks: [
          ...(
            definition
              ?.recommendedChecks ??
            hypothesis
              .recommendedTestIds
          ),
        ],

        possibleParts: [
          ...(
            definition
              ?.possibleParts ??
            hypothesis
              .possiblePartIds
          ),
        ],
      };

    session.conclusion =
      conclusion;

    session.status =
      "completed";

    session.pendingAction =
      null;

    session.currentActionId =
      null;

    session.updatedAt =
      new Date().toISOString();
  }

  private synchronizeHypotheses(
    session:
      LegacyDiagnosticSession,

    reasoning:
      ReasoningV2Result,
  ): void {

    const eliminatedIds =
      reasoning.context
        .eliminatedHypothesisIds;

    session.hypotheses =
      reasoning.decision
        .probabilities
        .map(
          result => {

            const state:
              LegacyDiagnosticHypothesis = {

                id:
                  result.hypothesis.id,

                label:
                  result.hypothesis.name,

                probability:
                  result.probability,

                eliminated:
                  eliminatedIds.has(
                    result.hypothesis.id,
                  ),

                supportingEvidenceIds:
                  result.hypothesis
                    .supportingEvidenceIds
                    .filter(
                      evidenceId =>
                        reasoning.context
                          .confirmedEvidenceIds
                          .has(evidenceId),
                    ),

                contradictingEvidenceIds:
                  result.hypothesis
                    .contradictingEvidenceIds
                    .filter(
                      evidenceId =>
                        reasoning.context
                          .confirmedEvidenceIds
                          .has(evidenceId),
                    ),

              };

            return state;

          },
        );

  }

  private addConfirmedEvidence(
    session:
      LegacyDiagnosticSession,

    knowledge:
      KnowledgePackage,

    evidenceId:
      string,

    source:
      LegacyDiagnosticEvidence["source"],

    createdAt:
      string,
  ): void {

    if (
      session.evidence.some(
        evidence =>
          evidence.id === evidenceId,
      )
    ) {
      return;
    }

    const definition =
      knowledge.evidences.find(
        evidence =>
          evidence.id === evidenceId,
      );

    session.evidence.push({

      id:
        evidenceId,

      label:
        definition?.label ??
        evidenceId,

      source,

      confidence:
        this.normalizeUnit(
          definition
            ?.defaultConfidence,
          this.options
            .defaultEvidenceReliability,
        ),

      createdAt,

    });

  }

  private removeEvidence(
    session:
      LegacyDiagnosticSession,

    evidenceId:
      string,
  ): void {

    session.evidence =
      session.evidence.filter(
        evidence =>
          evidence.id !== evidenceId,
      );

  }

  private recordActionResult(
    session:
      LegacyDiagnosticSession,

    action:
      LegacyDiagnosticAction,

    optionId:
      string | undefined,

    value:
      string,

    addedEvidenceIds:
      string[],

    rejectedEvidenceIds:
      string[],

    supportedHypothesisIds:
      string[],

    rejectedHypothesisIds:
      string[],

    completedAt:
      string,
  ): void {

    const result:
      DiagnosticActionResult = {

        actionId:
          action.id,

        optionId,

        value,

        completedAt,

        addedEvidenceIds: [
          ...addedEvidenceIds,
        ],

        rejectedEvidenceIds: [
          ...rejectedEvidenceIds,
        ],

        supportedHypothesisIds: [
          ...supportedHypothesisIds,
        ],

        rejectedHypothesisIds: [
          ...rejectedHypothesisIds,
        ],

      };

    const existingIndex =
      session.actionResults
        .findIndex(
          item =>
            item.actionId === action.id,
        );

    if (existingIndex >= 0) {

      session.actionResults[
        existingIndex
      ] = result;

    } else {

      session.actionResults.push(
        result,
      );

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

  }

  private collectRejectedEvidenceIds(
    session:
      LegacyDiagnosticSession,
  ): Set<string> {

    const latestStates =
      new Map<string, {
        state: "confirmed" | "rejected";
        completedAt: string;
      }>();

    for (
      const result
      of session.actionResults
    ) {

      for (
        const evidenceId
        of result.addedEvidenceIds
      ) {
        const previous =
          latestStates.get(
            evidenceId,
          );

        if (
          !previous ||
          result.completedAt >=
            previous.completedAt
        ) {
          latestStates.set(
            evidenceId,
            {
              state: "confirmed",
              completedAt:
                result.completedAt,
            },
          );
        }
      }

      for (
        const evidenceId
        of result.rejectedEvidenceIds
      ) {
        const previous =
          latestStates.get(
            evidenceId,
          );

        if (
          !previous ||
          result.completedAt >=
            previous.completedAt
        ) {
          latestStates.set(
            evidenceId,
            {
              state: "rejected",
              completedAt:
                result.completedAt,
            },
          );
        }
      }
    }

    return new Set(
      [...latestStates.entries()]
        .filter(
          ([, value]) =>
            value.state ===
              "rejected",
        )
        .map(
          ([evidenceId]) =>
            evidenceId,
        ),
    );
  }

  private collectSupportedHypothesisIds(
    session:
      LegacyDiagnosticSession,
  ): Set<string> {

    const latestStates =
      new Map<string, {
        state: "supported" | "rejected";
        completedAt: string;
      }>();

    for (
      const result
      of session.actionResults
    ) {

      for (
        const hypothesisId
        of result.supportedHypothesisIds
      ) {
        const previous =
          latestStates.get(
            hypothesisId,
          );

        if (
          !previous ||
          result.completedAt >=
            previous.completedAt
        ) {
          latestStates.set(
            hypothesisId,
            {
              state: "supported",
              completedAt:
                result.completedAt,
            },
          );
        }
      }

      for (
        const hypothesisId
        of result.rejectedHypothesisIds
      ) {
        const previous =
          latestStates.get(
            hypothesisId,
          );

        if (
          !previous ||
          result.completedAt >=
            previous.completedAt
        ) {
          latestStates.set(
            hypothesisId,
            {
              state: "rejected",
              completedAt:
                result.completedAt,
            },
          );
        }
      }
    }

    return new Set(
      [...latestStates.entries()]
        .filter(
          ([, value]) =>
            value.state ===
              "supported",
        )
        .map(
          ([hypothesisId]) =>
            hypothesisId,
        ),
    );
  }

  private collectRejectedHypothesisIds(
    session:
      LegacyDiagnosticSession,
  ): Set<string> {

    const latestStates =
      new Map<string, {
        state: "supported" | "rejected";
        completedAt: string;
      }>();

    for (
      const result
      of session.actionResults
    ) {

      for (
        const hypothesisId
        of result.supportedHypothesisIds
      ) {
        const previous =
          latestStates.get(
            hypothesisId,
          );

        if (
          !previous ||
          result.completedAt >=
            previous.completedAt
        ) {
          latestStates.set(
            hypothesisId,
            {
              state: "supported",
              completedAt:
                result.completedAt,
            },
          );
        }
      }

      for (
        const hypothesisId
        of result.rejectedHypothesisIds
      ) {
        const previous =
          latestStates.get(
            hypothesisId,
          );

        if (
          !previous ||
          result.completedAt >=
            previous.completedAt
        ) {
          latestStates.set(
            hypothesisId,
            {
              state: "rejected",
              completedAt:
                result.completedAt,
            },
          );
        }
      }
    }

    return new Set(
      [...latestStates.entries()]
        .filter(
          ([, value]) =>
            value.state ===
              "rejected",
        )
        .map(
          ([hypothesisId]) =>
            hypothesisId,
        ),
    );
  }

  private requireAction(
    knowledge:
      KnowledgePackage,

    actionId:
      string,
  ): LegacyDiagnosticAction {

    const action =
      knowledge.actions.find(
        candidate =>
          candidate.id === actionId,
      );

    if (!action) {

      throw new Error(
        `Action introuvable : "${actionId}".`,
      );

    }

    return action;

  }

  private resolveEvidenceSource(
    isConfirmed:
      boolean,

    isRejected:
      boolean,
  ): EvidenceSource {

    if (
      isConfirmed ||
      isRejected
    ) {
      return "user_answer";
    }

    return "inference";

  }

  private actionCost(
    action:
      LegacyDiagnosticAction,
  ): number {

    const complexityCost =
      action.complexity === "simple"
        ? 1
        : action.complexity === "intermediate"
          ? 2
          : 3;

    const typeCost =
      action.type === "request-measurement" ||
      action.type === "request-photo" ||
      action.type === "request-video" ||
      action.type === "request-obd-code"
        ? 1
        : 0;

    return (
      complexityCost +
      typeCost
    );

  }

  private unique(
    values:
      string[],
  ): string[] {

    return [
      ...new Set(values),
    ].sort(
      (left, right) =>
        left.localeCompare(right),
    );

  }

  private normalizeUnit(
    value:
      number | undefined,

    fallback:
      number,
  ): number {

    const sourceValue =
      Number.isFinite(value)
        ? value as number
        : fallback;

    const normalized =
      sourceValue > 1
        ? sourceValue / 100
        : sourceValue;

    return Math.min(
      1,
      Math.max(
        0,
        normalized,
      ),
    );

  }

  private validateOptions(
    options:
      DiagnosticEngineV2Options,
  ): void {

    this.validateUnit(
      "defaultEvidenceReliability",
      options.defaultEvidenceReliability,
    );

    this.validatePositive(
      "defaultHypothesisBaseScore",
      options.defaultHypothesisBaseScore,
    );

    this.validateUnit(
      "defaultHypothesisConfidence",
      options.defaultHypothesisConfidence,
    );

    this.validateUnit(
      "conclusionThreshold",
      options.conclusionThreshold,
    );

    if (
      !Number.isInteger(
        options.maximumAlternativeCount,
      ) ||
      options.maximumAlternativeCount < 0
    ) {

      throw new RangeError(
        "maximumAlternativeCount doit Ãªtre un entier positif ou nul.",
      );

    }

    if (
      !Number.isInteger(
        options.maximumParticulierQuestions,
      ) ||
      options.maximumParticulierQuestions < 3
    ) {

      throw new RangeError(
        "maximumParticulierQuestions doit Ãªtre un entier strictement positif.",
      );

    }

  }

  private validateUnit(
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
        `${name} doit Ãªtre un nombre fini strictement positif.`,
      );

    }

  }

  private validatePositive(
    name:
      string,

    value:
      number,
  ): void {

    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {

      throw new RangeError(
        `${name} doit Ãªtre un nombre fini compris entre 0 et 1.`,
      );

    }

  }

}




















