import type {
  Question,
} from "./types";

import {
  knowledgeQuestions,
  type KnowledgeQuestionTemplate,
} from "./knowledge/questions";

export function findQuestionById(
  questionId: string,
): KnowledgeQuestionTemplate | null {

  return (
    knowledgeQuestions.find(
      question =>
        question.id === questionId,
    ) ?? null
  );

}

export function convertKnowledgeQuestion(
  question: KnowledgeQuestionTemplate,
): Question {

  return {

    id:
      question.id,

    text:
      question.text,

    reason:
      question.purpose ??
      "Question de diagnostic.",

    targetHypotheses: [
      ...question.discriminates,
    ],

    expectedInformationGain:
      0,

    options:
      question.options.map(
        option => ({

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