import type { ChatMessage } from "./conversation";

import { normalizeText } from "./conversation";

import {
  knowledgeQuestions,
  type KnowledgeQuestionTemplate,
} from "./knowledge/questions";

export type DiagnosticDomain =
  | "starting"
  | "electrical"
  | "brakes"
  | "wheels"
  | "suspension"
  | "transmission"
  | "engine"
  | "cooling"
  | "exhaust"
  | "steering";

export type ConversationManagerResult = {
  activeMessages: ChatMessage[];
  conversationReset: boolean;
  previousDomain: DiagnosticDomain | null;
  activeDomain: DiagnosticDomain | null;
  activeConversationStartIndex: number;
  pendingQuestion: KnowledgeQuestionTemplate | null;
  invalidAnswer: string | null;
};

type DomainRule = {
  pattern: RegExp;
  score: number;
};

type DomainDetection = {
  index: number;
  domain: DiagnosticDomain;
  score: number;
};

const domainRules: Record<DiagnosticDomain, DomainRule[]> = {
  starting: [
    { pattern: /\bne demarre pas\b/, score: 8 },
    { pattern: /\bdemarre mal\b/, score: 6 },
    { pattern: /\bprobleme de demarrage\b/, score: 8 },
    { pattern: /\bdemarrage\b/, score: 5 },
    { pattern: /\bdemarreur\b/, score: 6 },
    { pattern: /\bclics? rapides?\b/, score: 5 },
    { pattern: /\bbooster\b/, score: 5 },
    { pattern: /\bcables? de demarrage\b/, score: 6 },
  ],
  electrical: [
    { pattern: /\bbatterie\b/, score: 5 },
    { pattern: /\balternateur\b/, score: 6 },
    { pattern: /\bplus de courant\b/, score: 7 },
    { pattern: /\bfusibles?\b/, score: 5 },
    { pattern: /\belectri(?:que|cite)\b/, score: 5 },
  ],
  brakes: [
    { pattern: /\bfrein(?:e|er|age|s)?\b/, score: 6 },
    { pattern: /\bplaquettes?\b/, score: 6 },
    { pattern: /\bdisques? de frein\b/, score: 7 },
    { pattern: /\betriers?\b/, score: 6 },
    { pattern: /\bpedale de frein\b/, score: 7 },
    { pattern: /\babs\b/, score: 5 },
  ],
  wheels: [
    { pattern: /\broues?\b/, score: 4 },
    { pattern: /\bpneus?\b/, score: 5 },
    { pattern: /\broulements?\b/, score: 6 },
    { pattern: /\bjantes?\b/, score: 5 },
    { pattern: /\bequilibrage\b/, score: 6 },
    { pattern: /\bparallelisme\b/, score: 6 },
  ],
  suspension: [
    { pattern: /\bsuspension\b/, score: 6 },
    { pattern: /\bamortisseurs?\b/, score: 6 },
    { pattern: /\bressorts?\b/, score: 5 },
    { pattern: /\btriangle de suspension\b/, score: 7 },
    { pattern: /\bsilentblocs?\b/, score: 6 },
    { pattern: /\bbiellettes?\b/, score: 6 },
    { pattern: /\btrou\b/, score: 3 },
    { pattern: /\bbosse\b/, score: 3 },
  ],
  transmission: [
    { pattern: /\bboite de vitesses?\b/, score: 7 },
    { pattern: /\bembrayage\b/, score: 6 },
    { pattern: /\btransmission\b/, score: 6 },
    { pattern: /\bcardans?\b/, score: 6 },
    { pattern: /\bvitesses? ne passent?\b/, score: 7 },
  ],
  engine: [
    { pattern: /\bmoteur\b/, score: 4 },
    { pattern: /\binjection\b/, score: 6 },
    { pattern: /\binjecteurs?\b/, score: 6 },
    { pattern: /\bbougies?\b/, score: 5 },
    { pattern: /\bperte de puissance\b/, score: 6 },
    { pattern: /\brat(?:e|es|er|ement)\b/, score: 5 },
    { pattern: /\bcale\b/, score: 5 },
  ],
  cooling: [
    { pattern: /\bsurchauffe\b/, score: 7 },
    { pattern: /\btemperature moteur\b/, score: 6 },
    { pattern: /\bliquide de refroidissement\b/, score: 7 },
    { pattern: /\bradiateur\b/, score: 6 },
    { pattern: /\bcalorstat\b/, score: 6 },
  ],
  exhaust: [
    { pattern: /\bechappement\b/, score: 6 },
    { pattern: /\bfap\b/, score: 6 },
    { pattern: /\bvanne egr\b/, score: 6 },
    { pattern: /\bfumee\b/, score: 5 },
    { pattern: /\bcatalyseur\b/, score: 6 },
  ],
  steering: [
    { pattern: /\bdirection\b/, score: 5 },
    { pattern: /\bvolant\b/, score: 4 },
    { pattern: /\bcremaillere\b/, score: 6 },
    { pattern: /\bdirection assistee\b/, score: 7 },
    { pattern: /\btourne difficilement\b/, score: 6 },
  ],
};

const positiveAnswers = new Set([
  "oui",
  "yes",
  "exact",
  "exactement",
  "c est ca",
  "tout a fait",
]);

const negativeAnswers = new Set([
  "non",
  "no",
  "pas du tout",
  "aucun",
  "aucune",
]);

const unknownAnswers = new Set([
  "je ne sais pas",
  "pas encore teste",
  "pas teste",
  "aucune idee",
  "inconnu",
  "difficile a dire",
  "impossible a dire",
]);

function findQuestionTemplate(
  assistantMessage: string,
): KnowledgeQuestionTemplate | null {
  const normalizedMessage = normalizeText(assistantMessage);

  return (
    knowledgeQuestions.find((question) => {
      const normalizedQuestion = normalizeText(question.text);

      return (
        normalizedMessage === normalizedQuestion ||
        normalizedMessage.includes(normalizedQuestion)
      );
    }) ?? null
  );
}

function matchesQuestionOption(
  question: KnowledgeQuestionTemplate,
  answer: string,
): boolean {
  const normalizedAnswer = normalizeText(answer);

  if (!normalizedAnswer) {
    return false;
  }

  return question.options.some((option) => {
    const normalizedValue = normalizeText(option.value);
    const normalizedLabel = normalizeText(option.label);

    return (
      normalizedAnswer === normalizedValue ||
      normalizedAnswer === normalizedLabel ||
      (normalizedValue.length > 2 &&
        normalizedAnswer.includes(normalizedValue)) ||
      (normalizedLabel.length > 4 &&
        normalizedAnswer.includes(normalizedLabel))
    );
  });
}

function isRecognizedGenericAnswer(answer: string): boolean {
  const normalizedAnswer = normalizeText(answer);

  if (!normalizedAnswer) {
    return false;
  }

  if (
    positiveAnswers.has(normalizedAnswer) ||
    negativeAnswers.has(normalizedAnswer) ||
    unknownAnswers.has(normalizedAnswer)
  ) {
    return true;
  }

  return (
    normalizedAnswer.startsWith("oui ") ||
    normalizedAnswer.startsWith("non ") ||
    normalizedAnswer.includes(" pas du tout") ||
    normalizedAnswer.includes("je ne sais pas") ||
    normalizedAnswer.includes("pas encore teste")
  );
}

function isValidAnswer(
  question: KnowledgeQuestionTemplate,
  answer: string,
): boolean {
  return (
    matchesQuestionOption(question, answer) ||
    isRecognizedGenericAnswer(answer)
  );
}

function detectDomain(
  content: string,
): { domain: DiagnosticDomain; score: number } | null {
  const normalized = normalizeText(content);

  if (!normalized) {
    return null;
  }

  const detections = (
    Object.keys(domainRules) as DiagnosticDomain[]
  )
    .map((domain) => ({
      domain,
      score: domainRules[domain].reduce(
        (total, rule) =>
          rule.pattern.test(normalized)
            ? total + rule.score
            : total,
        0,
      ),
    }))
    .sort(
      (first, second) =>
        second.score - first.score,
    );

  const best = detections[0];
  const second = detections[1];

  if (!best || best.score < 4) {
    return null;
  }

  if (second && second.score === best.score) {
    return null;
  }

  return best;
}

function collectDomainDetections(
  messages: ChatMessage[],
): DomainDetection[] {
  const detections: DomainDetection[] = [];

  messages.forEach((message, index) => {
    if (message.role !== "user") {
      return;
    }

    const detection = detectDomain(message.content);

    if (!detection) {
      return;
    }

    detections.push({
      index,
      domain: detection.domain,
      score: detection.score,
    });
  });

  return detections;
}

function findLatestPendingQuestion(
  messages: ChatMessage[],
): {
  question: KnowledgeQuestionTemplate | null;
  invalidAnswer: string | null;
} {
  for (
    let index = messages.length - 1;
    index >= 0;
    index -= 1
  ) {
    const message = messages[index];

    if (message.role !== "assistant") {
      continue;
    }

    const question = findQuestionTemplate(
      message.content,
    );

    if (!question) {
      continue;
    }

    const nextMessage = messages[index + 1];

    if (
      !nextMessage ||
      nextMessage.role !== "user"
    ) {
      return {
        question,
        invalidAnswer: null,
      };
    }

    if (
      isValidAnswer(
        question,
        nextMessage.content,
      )
    ) {
      return {
        question: null,
        invalidAnswer: null,
      };
    }

    return {
      question,
      invalidAnswer: nextMessage.content,
    };
  }

  return {
    question: null,
    invalidAnswer: null,
  };
}

function findConversationBoundary(
  messages: ChatMessage[],
): {
  startIndex: number;
  previousDomain: DiagnosticDomain | null;
  activeDomain: DiagnosticDomain | null;
  reset: boolean;
} {
  const detections = collectDomainDetections(
    messages,
  );

  if (detections.length === 0) {
    return {
      startIndex: 0,
      previousDomain: null,
      activeDomain: null,
      reset: false,
    };
  }

  const latest =
    detections[detections.length - 1];

  let previousDifferent: DomainDetection | null =
    null;

  for (
    let index = detections.length - 2;
    index >= 0;
    index -= 1
  ) {
    const candidate = detections[index];

    if (candidate.domain !== latest.domain) {
      previousDifferent = candidate;
      break;
    }
  }

  if (!previousDifferent) {
    return {
      startIndex: 0,
      previousDomain: null,
      activeDomain: latest.domain,
      reset: false,
    };
  }

  return {
    startIndex: latest.index,
    previousDomain: previousDifferent.domain,
    activeDomain: latest.domain,
    reset: true,
  };
}

export function prepareConversation(
  messages: ChatMessage[],
): ConversationManagerResult {
  const boundary = findConversationBoundary(
    messages,
  );

  const activeMessages = messages.slice(
    boundary.startIndex,
  );

  const pending = findLatestPendingQuestion(
    activeMessages,
  );

  return {
    activeMessages,
    conversationReset: boundary.reset,
    previousDomain: boundary.previousDomain,
    activeDomain: boundary.activeDomain,
    activeConversationStartIndex:
      boundary.startIndex,
    pendingQuestion: pending.question,
    invalidAnswer: pending.invalidAnswer,
  };
}

