import type {
  ChatMessage,
} from "./conversation";

import type {
  ConversationState,
  Hypothesis,
  Question,
} from "./types";

import type {
  KnowledgeEntity,
} from "./knowledge/types";

import {
  createEmptyConversation,
  normalizeText,
} from "./conversation";

import {
  DiagnosticMemory,
} from "./diagnosticMemory";

import {
  buildDiagnosticContext,
} from "./diagnosticContext";

import {
  detectChiefComplaint,
} from "./chiefComplaint";

import {
  makeDiagnosticDecision,
} from "./decisionEngine";

import {
  rescoreHypotheses,
} from "./scoringEngine";

import {
  buildDiagnostic,
} from "./diagnosticBuilder";

import {
  findEntitiesInText,
} from "./knowledge/matcher";

import {
  generateGraphHypotheses,
} from "./knowledge/reasoning";

import {
  interpretConversationAnswers,
} from "./knowledge/answerInterpreter";

import {
  knowledgeQuestions,
  type KnowledgeQuestionTemplate,
} from "./knowledge/questions";

import {
  selectNextQuestion,
} from "./questionEngine";

function normalizeMessageText(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
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

function isDiagnosticConclusionMessage(
  message: ChatMessage,
): boolean {
  if (
    message.role !==
    "assistant"
  ) {
    return false;
  }

  const normalizedContent =
    normalizeMessageText(
      message.content,
    );

  return (
    normalizedContent.includes(
      "le diagnostic le plus probable est",
    ) ||
    normalizedContent.includes(
      "diagnostic probable",
    ) ||
    normalizedContent.includes(
      "niveau de confiance",
    )
  );
}

function getActiveConversationMessages(
  messages: ChatMessage[],
): ChatMessage[] {
  let lastConclusionIndex =
    -1;

  for (
    let index = 0;
    index < messages.length;
    index += 1
  ) {
    if (
      isDiagnosticConclusionMessage(
        messages[index],
      )
    ) {
      lastConclusionIndex =
        index;
    }
  }

  if (
    lastConclusionIndex < 0
  ) {
    return messages;
  }

  const messagesAfterConclusion =
    messages.slice(
      lastConclusionIndex + 1,
    );

  const hasNewUserMessage =
    messagesAfterConclusion.some(
      (message) =>
        message.role ===
          "user" &&
        message.content.trim()
          .length > 0,
    );

  return hasNewUserMessage
    ? messagesAfterConclusion
    : messages;
}

function findQuestionFromAssistantMessage(
  content: string,
): KnowledgeQuestionTemplate | null {
  const normalizedContent =
    normalizeText(
      content,
    );

  return (
    knowledgeQuestions.find(
      (question) => {
        const normalizedQuestion =
          normalizeText(
            question.text,
          );

        return (
          normalizedContent ===
            normalizedQuestion ||
          normalizedContent.includes(
            normalizedQuestion,
          )
        );
      },
    ) ?? null
  );
}

/*
 * Les réponses aux boutons/questions structurées ne doivent
 * jamais être rematchées comme du texte libre.
 *
 * Exemple :
 * « Les phares ne varient pas » ne doit pas confirmer
 * l’entité positive « les phares varient ».
 */
function getFreeTextUserMessages(
  messages: ChatMessage[],
  unansweredUserMessage:
    string | null,
): ChatMessage[] {
  const freeTextMessages:
    ChatMessage[] = [];

  const normalizedUnansweredMessage =
    unansweredUserMessage
      ? normalizeText(
          unansweredUserMessage,
        )
      : "";

  for (
    let index = 0;
    index < messages.length;
    index += 1
  ) {
    const message =
      messages[index];

    if (
      message.role !==
      "user" ||
      !message.content.trim()
    ) {
      continue;
    }

    const previousMessage =
      index > 0
        ? messages[index - 1]
        : null;

    const previousQuestion =
      previousMessage?.role ===
      "assistant"
        ? findQuestionFromAssistantMessage(
            previousMessage.content,
          )
        : null;

    /*
     * Ce message répond à une question connue.
     * L’AnswerInterpreter est seul responsable
     * de son interprétation.
     */
    if (
      previousQuestion
    ) {
      const isUnansweredFreeText =
        normalizedUnansweredMessage.length >
          0 &&
        normalizeText(
          message.content,
        ) ===
          normalizedUnansweredMessage;

      if (
        !isUnansweredFreeText
      ) {
        continue;
      }
    }

    freeTextMessages.push(
      message,
    );
  }

  return freeTextMessages;
}

function buildUserConversationText(
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
    .filter(
      (content) =>
        content.length > 0,
    )
    .join(" ");
}

function findAnchorEntity(
  messages: ChatMessage[],
): KnowledgeEntity | null {
  for (
    const message
    of messages
  ) {
    if (
      message.role !==
      "user"
    ) {
      continue;
    }

    const entities =
      findEntitiesInText(
        message.content,
      );

    const symptom =
      entities.find(
        (entity) =>
          entity.type ===
          "symptom",
      );

    if (
      symptom
    ) {
      return symptom;
    }

    const observation =
      entities.find(
        (entity) =>
          entity.type ===
          "observation",
      );

    if (
      observation
    ) {
      return observation;
    }

    const engineEntity =
      entities.find(
        (entity) =>
          entity.type ===
          "engine",
      );

    if (
      engineEntity
    ) {
      return engineEntity;
    }

    const vehicleEntity =
      entities.find(
        (entity) =>
          entity.type ===
          "vehicle",
      );

    if (
      vehicleEntity
    ) {
      return vehicleEntity;
    }

    if (
      entities.length > 0
    ) {
      return entities[0];
    }
  }

  return null;
}

function findQuestionById(
  questionId:
    string |
    null |
    undefined,
): KnowledgeQuestionTemplate | null {
  if (
    !questionId
  ) {
    return null;
  }

  return (
    knowledgeQuestions.find(
      (question) =>
        question.id ===
        questionId,
    ) ?? null
  );
}

function convertKnowledgeQuestion(
  question:
    KnowledgeQuestionTemplate,
): Question {
  return {
    id:
      question.id,

    text:
      question.text,

    reason:
      question.purpose ??
      "Cette question permet de préciser le diagnostic.",

    targetHypotheses: [
      ...question.discriminates,
    ],

    expectedInformationGain:
      0,

    options:
      question.options.map(
        (option) => ({
          id:
            option.id,

          label:
            option.label,

          value:
            option.value,

          addsEvidence:
            option.addsEvidence,

          supports:
            option.supports,

          rejects:
            option.rejects,
        }),
      ),
  };
}

function getPrimaryHypothesis(
  hypotheses: Hypothesis[],
  primaryHypothesisId:
    string | null,
): Hypothesis | null {
  if (
    hypotheses.length === 0
  ) {
    return null;
  }

  if (
    primaryHypothesisId
  ) {
    const selected =
      hypotheses.find(
        (hypothesis) =>
          hypothesis.id ===
          primaryHypothesisId,
      );

    if (
      selected
    ) {
      return selected;
    }
  }

  return (
    hypotheses.find(
      (hypothesis) =>
        !hypothesis.eliminated,
    ) ?? null
  );
}

function populateMemoryFromDetectedEntities(
  memory: DiagnosticMemory,
  entities: KnowledgeEntity[],
  conversationText: string,
): void {
  for (
    const entity
    of entities
  ) {
    memory.detect(
      entity.id,
      {
        source:
          "free-text",

        value:
          conversationText,
      },
    );

    memory.confirm(
      entity.id,
      {
        source:
          "free-text",

        value:
          conversationText,
      },
    );
  }
}

function populateMemoryFromAnswers(
  memory: DiagnosticMemory,
  interpreted:
    ReturnType<
      typeof interpretConversationAnswers
    >,
): void {
  for (
    const entityId
    of interpreted.confirmedEntityIds
  ) {
    memory.confirm(
      entityId,
      {
        source:
          "structured-option",
      },
    );
  }

  for (
    const entityId
    of interpreted.rejectedEntityIds
  ) {
    memory.reject(
      entityId,
      {
        source:
          "structured-option",
      },
    );
  }

  for (
    const entityId
    of interpreted.unknownEntityIds
  ) {
    memory.markUnknown(
      entityId,
      {
        source:
          "question-answer",
      },
    );
  }

  for (
    const questionId
    of interpreted.askedQuestionIds
  ) {
    memory.markQuestionAnswered(
      questionId,
    );
  }

  if (
    interpreted.unansweredQuestionId
  ) {
    memory.setPendingQuestion(
      interpreted.unansweredQuestionId,
    );
  } else {
    memory.clearPendingQuestion();
  }
}

export function buildConversationEngine(
  messages: ChatMessage[],
): ConversationState {
  const state =
    createEmptyConversation();

  const activeMessages =
    getActiveConversationMessages(
      messages,
    );

  const interpreted =
    interpretConversationAnswers(
      activeMessages,
    );

  /*
   * Seuls les vrais messages libres sont transmis
   * au matcher.
   */
  const freeTextMessages =
    getFreeTextUserMessages(
      activeMessages,
      interpreted.unansweredUserMessage,
    );

  const conversationText =
    buildUserConversationText(
      freeTextMessages,
    );

  const chiefComplaint =
    detectChiefComplaint(
      conversationText,
    );

  const detectedEntities =
    findEntitiesInText(
      conversationText,
    );

  const anchorEntity =
    findAnchorEntity(
      freeTextMessages,
    );

  const memory =
    DiagnosticMemory.fromState(
      state.memory,
    );

  populateMemoryFromDetectedEntities(
    memory,
    detectedEntities,
    conversationText,
  );

  populateMemoryFromAnswers(
    memory,
    interpreted,
  );

  const context =
    buildDiagnosticContext({
      detectedEntities,

      confirmedEntityIds:
        memory.getConfirmedEntityIds(),

      rejectedEntityIds:
        memory.getRejectedEntityIds(),

      unknownEntityIds:
        memory.getUnknownEntityIds(),

      memory:
        memory.toState(),

      anchorEntity,
    });

  memory.setActiveDomain(
    chiefComplaint.confidence >= 0.60
      ? chiefComplaint.domain
      : context.activeDomain,
  );

  state.confirmedEntityIds = [
    ...context.confirmedEntityIds,
  ];

  state.rejectedEntityIds = [
    ...context.rejectedEntityIds,
  ];

  state.askedQuestions = [
    ...interpreted.askedQuestionIds,
  ];

  const graphHypotheses =
    generateGraphHypotheses(
      context.confirmedEntities,
      context.rejectedEntities,
    );

  /*
   * Le graphe construit les hypothèses et leurs preuves.
   * Le scoring engine recalcule ensuite leur probabilité
   * selon la force et la spécificité des observations.
   */
  state.hypotheses =
    rescoreHypotheses(
      graphHypotheses,
    );

  memory.snapshotHypotheses(
    state.hypotheses,
  );

  const unansweredQuestion =
    findQuestionById(
      interpreted.unansweredQuestionId,
    );

  if (
    unansweredQuestion
  ) {
    memory.setPendingQuestion(
      unansweredQuestion.id,
    );

    state.nextQuestion =
      convertKnowledgeQuestion(
        unansweredQuestion,
      );

    state.decision = {
      status:
        "collecting-information",

      primaryHypothesisId:
        null,

      confidence:
        0,

      explanation:
        "La nouvelle information a été enregistrée, mais elle ne répond pas à la question en cours.",
    };

    state.diagnosisComplete =
      false;

    state.diagnostic =
      null;

    state.memory =
      memory.toState();

    return state;
  }

  const candidateQuestion =
    selectNextQuestion(
      state.hypotheses,
      context.confirmedEntities,
      state.askedQuestions,
      chiefComplaint,
    );

  const diagnosticDecision =
    makeDiagnosticDecision({
      hypotheses:
        state.hypotheses,

      nextQuestion:
        candidateQuestion,

      askedQuestionIds:
        state.askedQuestions,

      confirmedEntityIds:
        context.confirmedEntityIds,

      rejectedEntityIds:
        context.rejectedEntityIds,
    });

  state.nextQuestion =
    diagnosticDecision.shouldAskQuestion
      ? diagnosticDecision.nextQuestion
      : null;

  if (
    state.nextQuestion
  ) {
    memory.setPendingQuestion(
      state.nextQuestion.id,
    );
  } else {
    memory.clearPendingQuestion();
  }

  state.decision = {
    status:
      diagnosticDecision.diagnosisComplete
        ? "diagnosis-complete"
        : "collecting-information",

    primaryHypothesisId:
      diagnosticDecision.primaryHypothesisId,

    confidence:
      diagnosticDecision.confidence,

    explanation:
      diagnosticDecision.explanation,
  };

  state.diagnosisComplete =
    diagnosticDecision.diagnosisComplete;

  if (
    diagnosticDecision.diagnosisComplete
  ) {
    const primaryHypothesis =
      getPrimaryHypothesis(
        state.hypotheses,
        diagnosticDecision.primaryHypothesisId,
      );

    state.diagnostic =
      buildDiagnostic(
        primaryHypothesis,
      );
  } else {
    state.diagnostic =
      null;
  }

  state.memory =
    memory.toState();

  return state;
}