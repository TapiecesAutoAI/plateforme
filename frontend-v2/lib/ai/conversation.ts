import type {
  ConversationState,
  DiagnosticAnswer,
  DiagnosticDecision,
  DiagnosticMemory,
  DiagnosticMemoryEvent,
  Vehicle,
} from "./types";

export type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

const emptyVehicle: Vehicle = {
  brand: null,
  model: null,
  year: null,
  engine: null,
  fuel: null,
  vin: null,
};

const emptyDecision:
  DiagnosticDecision = {
    status:
      "collecting-information",

    primaryHypothesisId:
      null,

    confidence:
      0,

    explanation:
      null,
  };

function createEmptyDiagnosticMemory():
  DiagnosticMemory {
  return {
    detectedEntityIds:
      [],

    confirmedEntityIds:
      [],

    rejectedEntityIds:
      [],

    unknownEntityIds:
      [],

    activeDomain:
      null,

    pendingQuestionId:
      null,

    askedQuestionIds:
      [],

    history:
      [],

    confidenceHistory:
      [],
  };
}

function createMemoryEvent(
  params: {
    entityId?: string | null;
    questionId?: string | null;
    optionId?: string | null;
    status:
      DiagnosticMemoryEvent["status"];
    source:
      DiagnosticMemoryEvent["source"];
    value: string;
    index: number;
  },
): DiagnosticMemoryEvent {
  const {
    entityId = null,
    questionId = null,
    optionId = null,
    status,
    source,
    value,
    index,
  } = params;

  return {
    id:
      `memory-event-${index}`,

    entityId,

    questionId,

    optionId,

    status,

    source,

    value,

    createdAt:
      new Date().toISOString(),
  };
}

export function createEmptyConversation():
  ConversationState {
  const memory =
    createEmptyDiagnosticMemory();

  return {
    vehicle: {
      ...emptyVehicle,
    },

    symptoms:
      [],

    hypotheses:
      [],

    askedQuestions:
      [],

    answers:
      [],

    /*
     * Compatibilité avec les fichiers actuels.
     * Ces tableaux seront synchronisés avec memory
     * pendant la migration.
     */
    confirmedEntityIds:
      [],

    rejectedEntityIds:
      [],

    memory,

    nextQuestion:
      null,

    decision: {
      ...emptyDecision,
    },

    diagnosisComplete:
      false,

    diagnostic:
      null,
  };
}

export function buildConversationState(
  messages: ChatMessage[],
): ConversationState {
  const state =
    createEmptyConversation();

  const memory =
    state.memory ??
    createEmptyDiagnosticMemory();

  let pendingQuestionId:
    string | null = null;

  for (
    let index = 0;
    index < messages.length;
    index += 1
  ) {
    const message =
      messages[index];

    const content =
      message.content.trim();

    if (
      !content
    ) {
      continue;
    }

    if (
      message.role ===
      "assistant"
    ) {
      pendingQuestionId =
        `conversation-question-${index}`;

      memory.pendingQuestionId =
        pendingQuestionId;

      if (
        !memory.askedQuestionIds.includes(
          pendingQuestionId,
        )
      ) {
        memory.askedQuestionIds.push(
          pendingQuestionId,
        );
      }

      if (
        !state.askedQuestions.includes(
          pendingQuestionId,
        )
      ) {
        state.askedQuestions.push(
          pendingQuestionId,
        );
      }

      continue;
    }

    /*
     * Un message utilisateur sans question en attente
     * est conservé comme texte libre. Il ne devient pas
     * automatiquement une preuve confirmée.
     */
    if (
      !pendingQuestionId
    ) {
      memory.history.push(
        createMemoryEvent({
          status:
            "detected",

          source:
            "free-text",

          value:
            content,

          index,
        }),
      );

      continue;
    }

    const answer:
      DiagnosticAnswer = {
        questionId:
          pendingQuestionId,

        optionId:
          `free-text-${index}`,

        value:
          content,

        answeredAt:
          new Date().toISOString(),
      };

    state.answers.push(
      answer,
    );

    memory.history.push(
      createMemoryEvent({
        questionId:
          pendingQuestionId,

        optionId:
          answer.optionId,

        status:
          "detected",

        source:
          "question-answer",

        value:
          content,

        index,
      }),
    );

    pendingQuestionId =
      null;

    memory.pendingQuestionId =
      null;
  }

  state.memory =
    memory;

  /*
   * Synchronisation temporaire avec les anciens champs.
   */
  state.confirmedEntityIds = [
    ...memory.confirmedEntityIds,
  ];

  state.rejectedEntityIds = [
    ...memory.rejectedEntityIds,
  ];

  return state;
}

export function getLatestUserMessage(
  messages: ChatMessage[],
): string | null {
  for (
    let index =
      messages.length - 1;
    index >= 0;
    index -= 1
  ) {
    const message =
      messages[index];

    if (
      message.role ===
        "user" &&
      message.content.trim()
    ) {
      return (
        message.content.trim()
      );
    }
  }

  return null;
}

export function getUserConversationText(
  messages: ChatMessage[],
): string {
  return messages
    .filter(
      (message) =>
        message.role ===
        "user",
    )
    .map(
      (message) =>
        message.content.trim(),
    )
    .filter(Boolean)
    .join(" ");
}

export function hasAssistantAskedAbout(
  messages: ChatMessage[],
  keywords: string[],
): boolean {
  const normalizedKeywords =
    keywords.map(
      (keyword) =>
        normalizeText(
          keyword,
        ),
    );

  return messages
    .filter(
      (message) =>
        message.role ===
        "assistant",
    )
    .some(
      (message) => {
        const normalizedContent =
          normalizeText(
            message.content,
          );

        return normalizedKeywords.some(
          (keyword) =>
            normalizedContent.includes(
              keyword,
            ),
        );
      },
    );
}

export function normalizeText(
  text: string,
): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .replace(
      /[^\p{L}\p{N}\s]/gu,
      " ",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}