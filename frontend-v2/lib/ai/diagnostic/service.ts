import type { KnowledgeGraphData } from "../knowledge/types";

import { DiagnosticEngine } from "./engines";
import { selectNextDiagnosticQuestion } from "./questions";

import type {
  DiagnosticEngineOptions,
  DiagnosticEvidence,
  DiagnosticQuestion,
  DiagnosticResult,
  DiagnosticSession,
  DiagnosticSessionStatus,
  VehicleContext,
} from "./types";

/*
 * ============================================================
 * OUTILS INTERNES
 * ============================================================
 */

function createId(prefix: string): string {
  const randomPart = Math.random()
    .toString(36)
    .slice(2, 10);

  return `${prefix}-${Date.now()}-${randomPart}`;
}

function createTimestamp(): string {
  return new Date().toISOString();
}

function determineResultStatus(
  result: DiagnosticResult,
  nextQuestion?: DiagnosticQuestion,
): DiagnosticSessionStatus {
  if (
    result.status === "diagnosis-ready" ||
    result.status === "needs-test" ||
    result.status === "blocked"
  ) {
    return result.status;
  }

  if (nextQuestion) {
    return "collecting-information";
  }

  if (result.bestHypothesis) {
    return result.bestHypothesis.recommendedTestIds.length > 0
      ? "needs-test"
      : "diagnosis-ready";
  }

  return "blocked";
}

/*
 * ============================================================
 * SERVICE PUBLIC DE DIAGNOSTIC
 * ============================================================
 */

/**
 * Point d’entrée principal du diagnostic automobile.
 *
 * Ce service :
 *
 * 1. crée les sessions ;
 * 2. enregistre les réponses ;
 * 3. lance le calcul des hypothèses ;
 * 4. choisit la prochaine question ;
 * 5. retourne le résultat complet.
 */
export class DiagnosticService {
  private readonly graph: KnowledgeGraphData;

  private readonly engine: DiagnosticEngine;

  constructor(
    graph: KnowledgeGraphData,
    options: Partial<DiagnosticEngineOptions> = {},
  ) {
    this.graph = graph;
    this.engine = new DiagnosticEngine(
      graph,
      options,
    );
  }

  /*
   * ==========================================================
   * CRÉATION D’UNE SESSION
   * ==========================================================
   */

  createSession(
    vehicle: VehicleContext = {},
  ): DiagnosticSession {
    const timestamp = createTimestamp();

    return {
      id: createId("diagnostic-session"),
      status: "collecting-information",
      vehicle,
      evidence: [],
      askedQuestionIds: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  /*
   * ==========================================================
   * AJOUT D’UN ÉLÉMENT DE DIAGNOSTIC
   * ==========================================================
   */

  addEvidence(
    session: DiagnosticSession,
    evidence: Omit<
      DiagnosticEvidence,
      "id" | "createdAt"
    >,
  ): DiagnosticSession {
    const newEvidence: DiagnosticEvidence = {
      ...evidence,
      id: createId("evidence"),
      createdAt: createTimestamp(),
    };

    const existingEvidenceIndex =
      session.evidence.findIndex(
        (item) =>
          item.entityId === newEvidence.entityId,
      );

    let updatedEvidence: DiagnosticEvidence[];

    if (existingEvidenceIndex >= 0) {
      updatedEvidence = session.evidence.map(
        (item, index) =>
          index === existingEvidenceIndex
            ? newEvidence
            : item,
      );
    } else {
      updatedEvidence = [
        ...session.evidence,
        newEvidence,
      ];
    }

    return {
      ...session,
      evidence: updatedEvidence,
      updatedAt: createTimestamp(),
    };
  }

  /*
   * ==========================================================
   * ENREGISTREMENT D’UNE RÉPONSE
   * ==========================================================
   */

  answerQuestion(
    session: DiagnosticSession,
    question: DiagnosticQuestion,
    value: DiagnosticEvidence["value"],
    confidence = 1,
  ): DiagnosticSession {
    const sessionWithEvidence =
      this.addEvidence(session, {
        entityId: question.targetEntityId,
        value,
        confidence,
        source: "user",
      });

    const askedQuestionIds =
      sessionWithEvidence.askedQuestionIds.includes(
        question.id,
      )
        ? sessionWithEvidence.askedQuestionIds
        : [
            ...sessionWithEvidence.askedQuestionIds,
            question.id,
          ];

    return {
      ...sessionWithEvidence,
      askedQuestionIds,
      updatedAt: createTimestamp(),
    };
  }

  /*
   * ==========================================================
   * ANALYSE COMPLÈTE
   * ==========================================================
   */

  analyze(
    session: DiagnosticSession,
  ): DiagnosticSession {
    const engineResult =
      this.engine.analyze(session);

    const nextQuestion =
      engineResult.status ===
        "collecting-information"
        ? selectNextDiagnosticQuestion(
            engineResult.hypotheses,
            session,
            this.graph,
          )
        : undefined;

    const status = determineResultStatus(
      engineResult,
      nextQuestion,
    );

    const result: DiagnosticResult = {
      ...engineResult,
      status,
      nextQuestion,
    };

    return {
      ...session,
      status,
      currentResult: result,
      updatedAt: createTimestamp(),
    };
  }

  /*
   * ==========================================================
   * CYCLE COMPLET APRÈS UNE RÉPONSE
   * ==========================================================
   */

  answerAndAnalyze(
    session: DiagnosticSession,
    question: DiagnosticQuestion,
    value: DiagnosticEvidence["value"],
    confidence = 1,
  ): DiagnosticSession {
    const updatedSession =
      this.answerQuestion(
        session,
        question,
        value,
        confidence,
      );

    return this.analyze(updatedSession);
  }
}

