import type {
  DiagnosticConfidenceSnapshot,
  DiagnosticDomain,
  DiagnosticMemory as DiagnosticMemoryState,
  DiagnosticMemoryEntityStatus,
  DiagnosticMemoryEvent,
  DiagnosticMemorySource,
  Hypothesis,
} from "./types";

export type DiagnosticMemoryEventInput = {
  entityId?: string | null;

  questionId?: string | null;

  optionId?: string | null;

  status: DiagnosticMemoryEntityStatus;

  source: DiagnosticMemorySource;

  value?: string;

  createdAt?: string;
};

export type DiagnosticMemorySnapshot = {
  detectedEntityIds: string[];

  confirmedEntityIds: string[];

  rejectedEntityIds: string[];

  unknownEntityIds: string[];

  activeDomain: DiagnosticDomain | null;

  pendingQuestionId: string | null;

  askedQuestionIds: string[];

  history: DiagnosticMemoryEvent[];

  confidenceHistory: DiagnosticConfidenceSnapshot[];
};

function uniqueValues(
  values: string[],
): string[] {
  return [
    ...new Set(
      values.filter(
        (value) =>
          value.trim().length > 0,
      ),
    ),
  ];
}

function createEventId(
  index: number,
): string {
  return (
    `diagnostic-memory-event-${Date.now()}-${index}`
  );
}

function normalizeEntityId(
  entityId:
    string |
    null |
    undefined,
): string | null {
  if (
    typeof entityId !==
    "string"
  ) {
    return null;
  }

  const normalized =
    entityId.trim();

  return normalized.length > 0
    ? normalized
    : null;
}

function normalizeQuestionId(
  questionId:
    string |
    null |
    undefined,
): string | null {
  if (
    typeof questionId !==
    "string"
  ) {
    return null;
  }

  const normalized =
    questionId.trim();

  return normalized.length > 0
    ? normalized
    : null;
}

function normalizeOptionId(
  optionId:
    string |
    null |
    undefined,
): string | null {
  if (
    typeof optionId !==
    "string"
  ) {
    return null;
  }

  const normalized =
    optionId.trim();

  return normalized.length > 0
    ? normalized
    : null;
}

function cloneEvent(
  event: DiagnosticMemoryEvent,
): DiagnosticMemoryEvent {
  return {
    ...event,
  };
}

function cloneConfidenceSnapshot(
  snapshot:
    DiagnosticConfidenceSnapshot,
): DiagnosticConfidenceSnapshot {
  return {
    ...snapshot,
  };
}

export class DiagnosticMemory {
  private readonly detectedEntityIds =
    new Set<string>();

  private readonly confirmedEntityIds =
    new Set<string>();

  private readonly rejectedEntityIds =
    new Set<string>();

  private readonly unknownEntityIds =
    new Set<string>();

  private readonly askedQuestionIds =
    new Set<string>();

  private readonly history:
    DiagnosticMemoryEvent[] = [];

  private readonly confidenceHistory:
    DiagnosticConfidenceSnapshot[] = [];

  private activeDomain:
    DiagnosticDomain |
    null = null;

  private pendingQuestionId:
    string |
    null = null;

  public constructor(
    initialState?:
      Partial<DiagnosticMemoryState> |
      null,
  ) {
    if (
      !initialState
    ) {
      return;
    }

    for (
      const entityId
      of uniqueValues(
        initialState.detectedEntityIds ??
          [],
      )
    ) {
      this.detectedEntityIds.add(
        entityId,
      );
    }

    for (
      const entityId
      of uniqueValues(
        initialState.confirmedEntityIds ??
          [],
      )
    ) {
      this.confirmedEntityIds.add(
        entityId,
      );

      this.detectedEntityIds.add(
        entityId,
      );
    }

    for (
      const entityId
      of uniqueValues(
        initialState.rejectedEntityIds ??
          [],
      )
    ) {
      this.rejectedEntityIds.add(
        entityId,
      );

      this.detectedEntityIds.add(
        entityId,
      );
    }

    for (
      const entityId
      of uniqueValues(
        initialState.unknownEntityIds ??
          [],
      )
    ) {
      this.unknownEntityIds.add(
        entityId,
      );

      this.detectedEntityIds.add(
        entityId,
      );
    }

    for (
      const questionId
      of uniqueValues(
        initialState.askedQuestionIds ??
          [],
      )
    ) {
      this.askedQuestionIds.add(
        questionId,
      );
    }

    this.activeDomain =
      initialState.activeDomain ??
      null;

    this.pendingQuestionId =
      normalizeQuestionId(
        initialState.pendingQuestionId,
      );

    this.history.push(
      ...(
        initialState.history ??
        []
      ).map(
        cloneEvent,
      ),
    );

    this.confidenceHistory.push(
      ...(
        initialState.confidenceHistory ??
        []
      ).map(
        cloneConfidenceSnapshot,
      ),
    );

    this.resolveStateConflicts();
  }

  public static createEmpty():
    DiagnosticMemory {
    return new DiagnosticMemory();
  }

  public static fromState(
    state:
      DiagnosticMemoryState |
      null |
      undefined,
  ): DiagnosticMemory {
    return new DiagnosticMemory(
      state,
    );
  }

  private resolveStateConflicts():
    void {
    /*
     * Ordre de priorité :
     *
     * confirmed > rejected > unknown > detected
     *
     * Une entité ne peut jamais appartenir simultanément
     * à plusieurs états décisionnels.
     */

    for (
      const entityId
      of this.confirmedEntityIds
    ) {
      this.rejectedEntityIds.delete(
        entityId,
      );

      this.unknownEntityIds.delete(
        entityId,
      );

      this.detectedEntityIds.add(
        entityId,
      );
    }

    for (
      const entityId
      of this.rejectedEntityIds
    ) {
      this.unknownEntityIds.delete(
        entityId,
      );

      this.detectedEntityIds.add(
        entityId,
      );
    }

    for (
      const entityId
      of this.unknownEntityIds
    ) {
      this.detectedEntityIds.add(
        entityId,
      );
    }
  }

  private addHistoryEvent(
    input:
      DiagnosticMemoryEventInput,
  ): DiagnosticMemoryEvent {
    const event:
      DiagnosticMemoryEvent = {
        id:
          createEventId(
            this.history.length,
          ),

        entityId:
          normalizeEntityId(
            input.entityId,
          ),

        questionId:
          normalizeQuestionId(
            input.questionId,
          ),

        optionId:
          normalizeOptionId(
            input.optionId,
          ),

        status:
          input.status,

        source:
          input.source,

        value:
          input.value?.trim() ??
          "",

        createdAt:
          input.createdAt ??
          new Date().toISOString(),
      };

    this.history.push(
      event,
    );

    return {
      ...event,
    };
  }

  public detect(
    entityId: string,
    options?: {
      source?: DiagnosticMemorySource;

      value?: string;

      questionId?: string | null;

      optionId?: string | null;
    },
  ): void {
    const normalizedEntityId =
      normalizeEntityId(
        entityId,
      );

    if (
      !normalizedEntityId
    ) {
      return;
    }

    this.detectedEntityIds.add(
      normalizedEntityId,
    );

    this.addHistoryEvent({
      entityId:
        normalizedEntityId,

      questionId:
        options?.questionId,

      optionId:
        options?.optionId,

      status:
        "detected",

      source:
        options?.source ??
        "free-text",

      value:
        options?.value ??
        "",
    });
  }

  public detectMany(
    entityIds: string[],
    options?: {
      source?: DiagnosticMemorySource;

      value?: string;

      questionId?: string | null;

      optionId?: string | null;
    },
  ): void {
    for (
      const entityId
      of uniqueValues(
        entityIds,
      )
    ) {
      this.detect(
        entityId,
        options,
      );
    }
  }

  public confirm(
    entityId: string,
    options?: {
      source?: DiagnosticMemorySource;

      value?: string;

      questionId?: string | null;

      optionId?: string | null;
    },
  ): void {
    const normalizedEntityId =
      normalizeEntityId(
        entityId,
      );

    if (
      !normalizedEntityId
    ) {
      return;
    }

    this.detectedEntityIds.add(
      normalizedEntityId,
    );

    this.confirmedEntityIds.add(
      normalizedEntityId,
    );

    this.rejectedEntityIds.delete(
      normalizedEntityId,
    );

    this.unknownEntityIds.delete(
      normalizedEntityId,
    );

    this.addHistoryEvent({
      entityId:
        normalizedEntityId,

      questionId:
        options?.questionId,

      optionId:
        options?.optionId,

      status:
        "confirmed",

      source:
        options?.source ??
        "structured-option",

      value:
        options?.value ??
        "",
    });
  }

  public confirmMany(
    entityIds: string[],
    options?: {
      source?: DiagnosticMemorySource;

      value?: string;

      questionId?: string | null;

      optionId?: string | null;
    },
  ): void {
    for (
      const entityId
      of uniqueValues(
        entityIds,
      )
    ) {
      this.confirm(
        entityId,
        options,
      );
    }
  }

  public reject(
    entityId: string,
    options?: {
      source?: DiagnosticMemorySource;

      value?: string;

      questionId?: string | null;

      optionId?: string | null;
    },
  ): void {
    const normalizedEntityId =
      normalizeEntityId(
        entityId,
      );

    if (
      !normalizedEntityId
    ) {
      return;
    }

    this.detectedEntityIds.add(
      normalizedEntityId,
    );

    this.rejectedEntityIds.add(
      normalizedEntityId,
    );

    this.confirmedEntityIds.delete(
      normalizedEntityId,
    );

    this.unknownEntityIds.delete(
      normalizedEntityId,
    );

    this.addHistoryEvent({
      entityId:
        normalizedEntityId,

      questionId:
        options?.questionId,

      optionId:
        options?.optionId,

      status:
        "rejected",

      source:
        options?.source ??
        "structured-option",

      value:
        options?.value ??
        "",
    });
  }

  public rejectMany(
    entityIds: string[],
    options?: {
      source?: DiagnosticMemorySource;

      value?: string;

      questionId?: string | null;

      optionId?: string | null;
    },
  ): void {
    for (
      const entityId
      of uniqueValues(
        entityIds,
      )
    ) {
      this.reject(
        entityId,
        options,
      );
    }
  }

  public markUnknown(
    entityId: string,
    options?: {
      source?: DiagnosticMemorySource;

      value?: string;

      questionId?: string | null;

      optionId?: string | null;
    },
  ): void {
    const normalizedEntityId =
      normalizeEntityId(
        entityId,
      );

    if (
      !normalizedEntityId
    ) {
      return;
    }

    this.detectedEntityIds.add(
      normalizedEntityId,
    );

    this.unknownEntityIds.add(
      normalizedEntityId,
    );

    this.confirmedEntityIds.delete(
      normalizedEntityId,
    );

    this.rejectedEntityIds.delete(
      normalizedEntityId,
    );

    this.addHistoryEvent({
      entityId:
        normalizedEntityId,

      questionId:
        options?.questionId,

      optionId:
        options?.optionId,

      status:
        "unknown",

      source:
        options?.source ??
        "question-answer",

      value:
        options?.value ??
        "",
    });
  }

  public markUnknownMany(
    entityIds: string[],
    options?: {
      source?: DiagnosticMemorySource;

      value?: string;

      questionId?: string | null;

      optionId?: string | null;
    },
  ): void {
    for (
      const entityId
      of uniqueValues(
        entityIds,
      )
    ) {
      this.markUnknown(
        entityId,
        options,
      );
    }
  }

  public removeEntity(
    entityId: string,
  ): void {
    const normalizedEntityId =
      normalizeEntityId(
        entityId,
      );

    if (
      !normalizedEntityId
    ) {
      return;
    }

    this.detectedEntityIds.delete(
      normalizedEntityId,
    );

    this.confirmedEntityIds.delete(
      normalizedEntityId,
    );

    this.rejectedEntityIds.delete(
      normalizedEntityId,
    );

    this.unknownEntityIds.delete(
      normalizedEntityId,
    );
  }

  public setActiveDomain(
    domain:
      DiagnosticDomain |
      null,
  ): void {
    this.activeDomain =
      domain;
  }

  public clearActiveDomain():
    void {
    this.activeDomain =
      null;
  }

  public getActiveDomain():
    DiagnosticDomain |
    null {
    return this.activeDomain;
  }

  public setPendingQuestion(
    questionId: string,
  ): void {
    const normalizedQuestionId =
      normalizeQuestionId(
        questionId,
      );

    if (
      !normalizedQuestionId
    ) {
      return;
    }

    this.pendingQuestionId =
      normalizedQuestionId;
  }

  public clearPendingQuestion():
    void {
    this.pendingQuestionId =
      null;
  }

  public getPendingQuestionId():
    string |
    null {
    return this.pendingQuestionId;
  }

  public markQuestionAsked(
    questionId: string,
  ): void {
    const normalizedQuestionId =
      normalizeQuestionId(
        questionId,
      );

    if (
      !normalizedQuestionId
    ) {
      return;
    }

    this.askedQuestionIds.add(
      normalizedQuestionId,
    );

    this.pendingQuestionId =
      normalizedQuestionId;
  }

  public markQuestionAnswered(
    questionId: string,
  ): void {
    const normalizedQuestionId =
      normalizeQuestionId(
        questionId,
      );

    if (
      !normalizedQuestionId
    ) {
      return;
    }

    this.askedQuestionIds.add(
      normalizedQuestionId,
    );

    if (
      this.pendingQuestionId ===
      normalizedQuestionId
    ) {
      this.pendingQuestionId =
        null;
    }
  }

  public snapshotHypotheses(
    hypotheses: Hypothesis[],
    recordedAt =
      new Date().toISOString(),
  ): void {
    for (
      const hypothesis
      of hypotheses
    ) {
      this.confidenceHistory.push({
        hypothesisId:
          hypothesis.id,

        probability:
          Math.max(
            0,
            Math.min(
              hypothesis.probability,
              1,
            ),
          ),

        recordedAt,
      });
    }
  }

  public isDetected(
    entityId: string,
  ): boolean {
    return this.detectedEntityIds.has(
      entityId,
    );
  }

  public isConfirmed(
    entityId: string,
  ): boolean {
    return this.confirmedEntityIds.has(
      entityId,
    );
  }

  public isRejected(
    entityId: string,
  ): boolean {
    return this.rejectedEntityIds.has(
      entityId,
    );
  }

  public isUnknown(
    entityId: string,
  ): boolean {
    return this.unknownEntityIds.has(
      entityId,
    );
  }

  public hasEntity(
    entityId: string,
  ): boolean {
    return (
      this.detectedEntityIds.has(
        entityId,
      ) ||
      this.confirmedEntityIds.has(
        entityId,
      ) ||
      this.rejectedEntityIds.has(
        entityId,
      ) ||
      this.unknownEntityIds.has(
        entityId,
      )
    );
  }

  public hasAskedQuestion(
    questionId: string,
  ): boolean {
    return this.askedQuestionIds.has(
      questionId,
    );
  }

  public getDetectedEntityIds():
    string[] {
    return [
      ...this.detectedEntityIds,
    ];
  }

  public getConfirmedEntityIds():
    string[] {
    return [
      ...this.confirmedEntityIds,
    ];
  }

  public getRejectedEntityIds():
    string[] {
    return [
      ...this.rejectedEntityIds,
    ];
  }

  public getUnknownEntityIds():
    string[] {
    return [
      ...this.unknownEntityIds,
    ];
  }

  public getAskedQuestionIds():
    string[] {
    return [
      ...this.askedQuestionIds,
    ];
  }

  public getHistory():
    DiagnosticMemoryEvent[] {
    return this.history.map(
      cloneEvent,
    );
  }

  public getConfidenceHistory():
    DiagnosticConfidenceSnapshot[] {
    return this.confidenceHistory.map(
      cloneConfidenceSnapshot,
    );
  }

  public clear():
    void {
    this.detectedEntityIds.clear();

    this.confirmedEntityIds.clear();

    this.rejectedEntityIds.clear();

    this.unknownEntityIds.clear();

    this.askedQuestionIds.clear();

    this.history.length =
      0;

    this.confidenceHistory.length =
      0;

    this.activeDomain =
      null;

    this.pendingQuestionId =
      null;
  }

  public toState():
    DiagnosticMemoryState {
    return {
      detectedEntityIds:
        this.getDetectedEntityIds(),

      confirmedEntityIds:
        this.getConfirmedEntityIds(),

      rejectedEntityIds:
        this.getRejectedEntityIds(),

      unknownEntityIds:
        this.getUnknownEntityIds(),

      activeDomain:
        this.activeDomain,

      pendingQuestionId:
        this.pendingQuestionId,

      askedQuestionIds:
        this.getAskedQuestionIds(),

      history:
        this.getHistory(),

      confidenceHistory:
        this.getConfidenceHistory(),
    };
  }

  public toSnapshot():
    DiagnosticMemorySnapshot {
    return {
      ...this.toState(),
    };
  }
}

export function createDiagnosticMemory(
  initialState?:
    Partial<DiagnosticMemoryState> |
    null,
): DiagnosticMemory {
  return new DiagnosticMemory(
    initialState,
  );
}