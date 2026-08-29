import type {
  ChatMessage,
} from "../conversation";

import {
  normalizeText,
} from "../conversation";

import {
  knowledgeQuestions,
  type KnowledgeQuestionTemplate,
} from "./questions";

export type InterpretedConversationAnswers = {
  confirmedEntityIds: string[];
  rejectedEntityIds: string[];
  unknownEntityIds: string[];

  askedQuestionIds: string[];

  unansweredQuestionId:
    string | null;

  unansweredUserMessage:
    string | null;
};

type QuestionOption =
  KnowledgeQuestionTemplate[
    "options"
  ][number];

type AnswerEffect =
  | "confirmed"
  | "rejected"
  | "unknown"
  | "unrecognized";

type OptionMatch = {
  option: QuestionOption;
  score: number;
};

const positiveAnswers =
  new Set([
    "oui",
    "yes",
    "exact",
    "exactement",
    "c est ca",
    "tout a fait",
    "affirmatif",
  ]);

const negativeAnswers =
  new Set([
    "non",
    "no",
    "pas du tout",
    "aucun",
    "aucune",
    "negatif",
  ]);

const unknownAnswers =
  new Set([
    "je ne sais pas",
    "j en sais rien",
    "pas encore teste",
    "pas teste",
    "aucune idee",
    "inconnu",
    "difficile a dire",
    "impossible a dire",
    "je ne peux pas verifier",
  ]);

const IGNORED_WORDS =
  new Set([
    "je",
    "j",
    "le",
    "la",
    "les",
    "un",
    "une",
    "des",
    "du",
    "de",
    "d",
    "au",
    "aux",
    "a",
    "et",
    "ou",
    "que",
    "qui",
    "quand",
    "lorsque",
    "pendant",
    "avec",
    "sans",
    "mon",
    "ma",
    "mes",
    "voiture",
    "vehicule",
    "moteur",
    "essaie",
    "essaye",
    "essayer",
    "demarrer",
    "demarrage",
  ]);

function tokenize(
  value: string,
): string[] {
  return normalizeText(
    value,
  )
    .split(/\s+/)
    .filter(Boolean);
}

function getMeaningfulTokens(
  value: string,
): string[] {
  return tokenize(
    value,
  ).filter(
    (token) =>
      !IGNORED_WORDS.has(
        token,
      ),
  );
}

function containsCompletePhrase(
  content: string,
  phrase: string,
): boolean {
  const normalizedContent =
    ` ${normalizeText(content)} `;

  const normalizedPhrase =
    ` ${normalizeText(phrase)} `;

  return (
    normalizedPhrase.trim()
      .length > 0 &&
    normalizedContent.includes(
      normalizedPhrase,
    )
  );
}

function calculateTokenCoverage(
  answer: string,
  candidate: string,
): number {
  const answerTokens =
    new Set(
      getMeaningfulTokens(
        answer,
      ),
    );

  const candidateTokens =
    getMeaningfulTokens(
      candidate,
    );

  if (
    answerTokens.size === 0 ||
    candidateTokens.length === 0
  ) {
    return 0;
  }

  const matchedTokens =
    candidateTokens.filter(
      (token) =>
        answerTokens.has(
          token,
        ),
    ).length;

  return (
    matchedTokens /
    candidateTokens.length
  );
}

function calculateOptionMatchScore(
  answer: string,
  option: QuestionOption,
): number {
  const normalizedAnswer =
    normalizeText(
      answer,
    );

  const normalizedLabel =
    normalizeText(
      option.label,
    );

  const normalizedValue =
    normalizeText(
      option.value,
    );

  if (
    !normalizedAnswer ||
    !normalizedLabel
  ) {
    return 0;
  }

  if (
    normalizedAnswer ===
      normalizedLabel ||
    normalizedAnswer ===
      normalizedValue
  ) {
    return 1;
  }

  if (
    containsCompletePhrase(
      normalizedAnswer,
      normalizedLabel,
    )
  ) {
    return 0.96;
  }

  if (
    normalizedValue.length > 4 &&
    containsCompletePhrase(
      normalizedAnswer,
      normalizedValue,
    )
  ) {
    return 0.94;
  }

  const labelCoverage =
    calculateTokenCoverage(
      normalizedAnswer,
      normalizedLabel,
    );

  const valueCoverage =
    calculateTokenCoverage(
      normalizedAnswer,
      normalizedValue,
    );

  const bestCoverage =
    Math.max(
      labelCoverage,
      valueCoverage,
    );

  if (
    bestCoverage >= 1
  ) {
    return 0.90;
  }

  if (
    bestCoverage >= 0.75
  ) {
    return 0.82;
  }

  if (
    bestCoverage >= 0.60
  ) {
    return 0.72;
  }

  return 0;
}

function findQuestionTemplate(
  assistantMessage: string,
): KnowledgeQuestionTemplate | null {
  const normalizedMessage =
    normalizeText(
      assistantMessage,
    );

  return (
    knowledgeQuestions.find(
      (question) => {
        const normalizedQuestion =
          normalizeText(
            question.text,
          );

        return (
          normalizedMessage ===
            normalizedQuestion ||
          normalizedMessage.includes(
            normalizedQuestion,
          )
        );
      },
    ) ?? null
  );
}

function optionImpliesUnknown(
  option: QuestionOption,
): boolean {
  const normalizedValue =
    normalizeText(
      option.value,
    );

  const normalizedLabel =
    normalizeText(
      option.label,
    );

  return (
    unknownAnswers.has(
      normalizedValue,
    ) ||
    unknownAnswers.has(
      normalizedLabel,
    ) ||
    normalizedValue.includes(
      "pas encore teste",
    ) ||
    normalizedValue.includes(
      "je ne sais pas",
    ) ||
    normalizedLabel.includes(
      "pas encore teste",
    ) ||
    normalizedLabel.includes(
      "je ne sais pas",
    )
  );
}

function optionImpliesRejection(
  option: QuestionOption,
): boolean {
  const normalizedValue =
    normalizeText(
      option.value,
    );

  const normalizedLabel =
    normalizeText(
      option.label,
    );

  return (
    normalizedLabel ===
      "non" ||
    normalizedLabel.startsWith(
      "non ",
    ) ||
    normalizedLabel.includes(
      "aucun clic",
    ) ||
    normalizedValue.startsWith(
      "non ",
    ) ||
    normalizedValue.includes(
      "ne demarre pas avec",
    )
  );
}

function findSelectedOption(
  question:
    KnowledgeQuestionTemplate,
  answer: string,
): QuestionOption | null {
  const normalizedAnswer =
    normalizeText(
      answer,
    );

  if (
    !normalizedAnswer
  ) {
    return null;
  }

  const matches:
    OptionMatch[] =
      question.options
        .map(
          (option) => ({
            option,

            score:
              calculateOptionMatchScore(
                normalizedAnswer,
                option,
              ),
          }),
        )
        .filter(
          (match) =>
            match.score >=
            0.72,
        )
        .sort(
          (
            first,
            second,
          ) =>
            second.score -
            first.score,
        );

  const bestMatch =
    matches[0];

  if (
    !bestMatch
  ) {
    return null;
  }

  const secondMatch =
    matches[1];

  if (
    secondMatch &&
    bestMatch.score -
      secondMatch.score <
      0.08
  ) {
    return null;
  }

  return bestMatch.option;
}

function interpretGenericAnswer(
  answer: string,
): AnswerEffect {
  const normalizedAnswer =
    normalizeText(
      answer,
    );

  if (
    !normalizedAnswer
  ) {
    return "unrecognized";
  }

  if (
    unknownAnswers.has(
      normalizedAnswer,
    )
  ) {
    return "unknown";
  }

  if (
    positiveAnswers.has(
      normalizedAnswer,
    )
  ) {
    return "confirmed";
  }

  if (
    negativeAnswers.has(
      normalizedAnswer,
    )
  ) {
    return "rejected";
  }

  return "unrecognized";
}

function questionAcceptsGenericBoolean(
  question:
    KnowledgeQuestionTemplate,
): boolean {
  const labels =
    question.options.map(
      (option) =>
        normalizeText(
          option.label,
        ),
    );

  const hasPositive =
    labels.some(
      (label) =>
        label === "oui" ||
        label.startsWith(
          "oui ",
        ),
    );

  const hasNegative =
    labels.some(
      (label) =>
        label === "non" ||
        label.startsWith(
          "non ",
        ),
    );

  return (
    hasPositive &&
    hasNegative
  );
}

function findBooleanOption(
  question:
    KnowledgeQuestionTemplate,
  effect: AnswerEffect,
): QuestionOption | null {
  if (
    effect !== "confirmed" &&
    effect !== "rejected"
  ) {
    return null;
  }

  return (
    question.options.find(
      (option) => {
        const label =
          normalizeText(
            option.label,
          );

        if (
          effect ===
          "confirmed"
        ) {
          return (
            label === "oui" ||
            label.startsWith(
              "oui ",
            )
          );
        }

        return (
          label === "non" ||
          label.startsWith(
            "non ",
          )
        );
      },
    ) ?? null
  );
}

function confirmEntity(
  entityId: string,
  confirmedEntityIds:
    Set<string>,
  rejectedEntityIds:
    Set<string>,
  unknownEntityIds:
    Set<string>,
): void {
  if (
    !entityId
  ) {
    return;
  }

  confirmedEntityIds.add(
    entityId,
  );

  rejectedEntityIds.delete(
    entityId,
  );

  unknownEntityIds.delete(
    entityId,
  );
}

function rejectEntity(
  entityId: string,
  confirmedEntityIds:
    Set<string>,
  rejectedEntityIds:
    Set<string>,
  unknownEntityIds:
    Set<string>,
): void {
  if (
    !entityId
  ) {
    return;
  }

  rejectedEntityIds.add(
    entityId,
  );

  confirmedEntityIds.delete(
    entityId,
  );

  unknownEntityIds.delete(
    entityId,
  );
}

function markEntityUnknown(
  entityId: string,
  confirmedEntityIds:
    Set<string>,
  rejectedEntityIds:
    Set<string>,
  unknownEntityIds:
    Set<string>,
): void {
  if (
    !entityId
  ) {
    return;
  }

  unknownEntityIds.add(
    entityId,
  );

  confirmedEntityIds.delete(
    entityId,
  );

  rejectedEntityIds.delete(
    entityId,
  );
}

function applySelectedOption(
  question:
    KnowledgeQuestionTemplate,
  option:
    QuestionOption,
  confirmedEntityIds:
    Set<string>,
  rejectedEntityIds:
    Set<string>,
  unknownEntityIds:
    Set<string>,
): void {
  if (
    optionImpliesUnknown(
      option,
    )
  ) {
    markEntityUnknown(
      question.targetEntityId,
      confirmedEntityIds,
      rejectedEntityIds,
      unknownEntityIds,
    );

    return;
  }

  const addedEvidence =
    option.addsEvidence ??
    [];

  const supportedEntities =
    option.supports ??
    [];

  const rejectedEntities =
    option.rejects ??
    [];

  for (
    const entityId
    of addedEvidence
  ) {
    confirmEntity(
      entityId,
      confirmedEntityIds,
      rejectedEntityIds,
      unknownEntityIds,
    );
  }

  for (
    const entityId
    of rejectedEntities
  ) {
    rejectEntity(
      entityId,
      confirmedEntityIds,
      rejectedEntityIds,
      unknownEntityIds,
    );
  }

  const hasStructuredEffects =
    addedEvidence.length > 0 ||
    supportedEntities.length > 0 ||
    rejectedEntities.length > 0;

  if (
    hasStructuredEffects
  ) {
    return;
  }

  if (
    optionImpliesRejection(
      option,
    )
  ) {
    rejectEntity(
      question.targetEntityId,
      confirmedEntityIds,
      rejectedEntityIds,
      unknownEntityIds,
    );

    return;
  }

  confirmEntity(
    question.targetEntityId,
    confirmedEntityIds,
    rejectedEntityIds,
    unknownEntityIds,
  );
}

export function interpretConversationAnswers(
  messages:
    ChatMessage[],
): InterpretedConversationAnswers {
  const confirmedEntityIds =
    new Set<string>();

  const rejectedEntityIds =
    new Set<string>();

  const unknownEntityIds =
    new Set<string>();

  const askedQuestionIds =
    new Set<string>();

  let unansweredQuestionId:
    string | null =
      null;

  let unansweredUserMessage:
    string | null =
      null;

  for (
    let index = 0;
    index <
      messages.length;
    index += 1
  ) {
    const assistantMessage =
      messages[index];

    if (
      assistantMessage.role !==
      "assistant"
    ) {
      continue;
    }

    const question =
      findQuestionTemplate(
        assistantMessage.content,
      );

    if (
      !question
    ) {
      continue;
    }

    const nextMessage =
      messages[
        index + 1
      ];

    if (
      !nextMessage ||
      nextMessage.role !==
        "user"
    ) {
      continue;
    }

    const selectedOption =
      findSelectedOption(
        question,
        nextMessage.content,
      );

    if (
      selectedOption
    ) {
      askedQuestionIds.add(
        question.id,
      );

      applySelectedOption(
        question,
        selectedOption,
        confirmedEntityIds,
        rejectedEntityIds,
        unknownEntityIds,
      );

      unansweredQuestionId =
        null;

      unansweredUserMessage =
        null;

      continue;
    }

    const genericEffect =
      interpretGenericAnswer(
        nextMessage.content,
      );

    if (
      genericEffect ===
      "unknown"
    ) {
      askedQuestionIds.add(
        question.id,
      );

      markEntityUnknown(
        question.targetEntityId,
        confirmedEntityIds,
        rejectedEntityIds,
        unknownEntityIds,
      );

      unansweredQuestionId =
        null;

      unansweredUserMessage =
        null;

      continue;
    }

    if (
      questionAcceptsGenericBoolean(
        question,
      )
    ) {
      const booleanOption =
        findBooleanOption(
          question,
          genericEffect,
        );

      if (
        booleanOption
      ) {
        askedQuestionIds.add(
          question.id,
        );

        applySelectedOption(
          question,
          booleanOption,
          confirmedEntityIds,
          rejectedEntityIds,
          unknownEntityIds,
        );

        unansweredQuestionId =
          null;

        unansweredUserMessage =
          null;

        continue;
      }
    }

    unansweredQuestionId =
      question.id;

    unansweredUserMessage =
      nextMessage.content;
  }

  return {
    confirmedEntityIds: [
      ...confirmedEntityIds,
    ],

    rejectedEntityIds: [
      ...rejectedEntityIds,
    ],

    unknownEntityIds: [
      ...unknownEntityIds,
    ],

    askedQuestionIds: [
      ...askedQuestionIds,
    ],

    unansweredQuestionId,

    unansweredUserMessage,
  };
}