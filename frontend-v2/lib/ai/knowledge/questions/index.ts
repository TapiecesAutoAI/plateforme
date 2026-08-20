import {
  startingQuestions,
} from "./starting";

import {
  noiseQuestions,
} from "./noise";

import {
  alternatorQuestions,
} from "./alternator";

import {
  batteryDischargeQuestions,
} from "./batteryDischarge";

import type {
  KnowledgeQuestionTemplate,
} from "./types";

export type {
  KnowledgeQuestionTemplate,
  QuestionOption as KnowledgeQuestionOption,
} from "./types";

export const knowledgeQuestions:
  KnowledgeQuestionTemplate[] = [
    ...startingQuestions,
    ...batteryDischargeQuestions,
    ...alternatorQuestions,
    ...noiseQuestions,
  ];

const questionsById =
  new Map<
    string,
    KnowledgeQuestionTemplate
  >();

const questionsByEntity =
  new Map<
    string,
    KnowledgeQuestionTemplate[]
  >();

const questionsByDomain =
  new Map<
    string,
    KnowledgeQuestionTemplate[]
  >();

for (
  const question
  of knowledgeQuestions
) {
  if (
    questionsById.has(
      question.id,
    )
  ) {
    throw new Error(
      `Question dupliquée : ${question.id}`,
    );
  }

  questionsById.set(
    question.id,
    question,
  );

  const entityQuestions =
    questionsByEntity.get(
      question.targetEntityId,
    ) ?? [];

  entityQuestions.push(
    question,
  );

  questionsByEntity.set(
    question.targetEntityId,
    entityQuestions,
  );

  for (
    const domain
    of question.domains
  ) {
    const domainQuestions =
      questionsByDomain.get(
        domain,
      ) ?? [];

    domainQuestions.push(
      question,
    );

    questionsByDomain.set(
      domain,
      domainQuestions,
    );
  }
}

function sortQuestions(
  questions:
    KnowledgeQuestionTemplate[],
): void {
  questions.sort(
    (
      firstQuestion,
      secondQuestion,
    ) =>
      firstQuestion.priority -
      secondQuestion.priority,
  );
}

for (
  const questions
  of questionsByEntity.values()
) {
  sortQuestions(
    questions,
  );
}

for (
  const questions
  of questionsByDomain.values()
) {
  sortQuestions(
    questions,
  );
}

export function getQuestionById(
  questionId: string,
): KnowledgeQuestionTemplate | null {
  return (
    questionsById.get(
      questionId,
    ) ?? null
  );
}

export function getQuestionsForEntity(
  entityId: string,
): KnowledgeQuestionTemplate[] {
  return [
    ...(
      questionsByEntity.get(
        entityId,
      ) ?? []
    ),
  ];
}

export function getQuestionForEntity(
  entityId: string,
): KnowledgeQuestionTemplate | null {
  return (
    questionsByEntity.get(
      entityId,
    )?.[0] ?? null
  );
}

export function getQuestionsByDomain(
  domain: string,
): KnowledgeQuestionTemplate[] {
  return [
    ...(
      questionsByDomain.get(
        domain,
      ) ?? []
    ),
  ];
}

export function getQuestionsForEntities(
  entityIds: string[],
): KnowledgeQuestionTemplate[] {
  const entityIdSet =
    new Set(
      entityIds,
    );

  return knowledgeQuestions
    .filter(
      (question) =>
        question.discriminates.some(
          (entityId) =>
            entityIdSet.has(
              entityId,
            ),
        ),
    )
    .sort(
      (
        firstQuestion,
        secondQuestion,
      ) =>
        firstQuestion.priority -
        secondQuestion.priority,
    );
}