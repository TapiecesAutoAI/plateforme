import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

import {
  KnowledgeLoader,
} from "../../engine/knowledge";

import {
  PartRecommendationEngineV2,
} from "../../engine/parts/PartRecommendationEngineV2";

import type {
  DiagnosticActionOption,
} from "../../engine/core/actionTypes";

import type {
  DiagnosticScenario,
  DiagnosticScenarioAnswer,
  DiagnosticScenarioResult,
  DiagnosticScenarioStep,
} from "./DiagnosticScenario";

function normalize(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .trim();
}

function contains(
  value: string,
  expected: string,
): boolean {
  return normalize(
    value,
  ).includes(
    normalize(
      expected,
    ),
  );
}

function findMatchingAnswer(
  scenario: DiagnosticScenario,
  actionId: string,
  actionText: string,
): DiagnosticScenarioAnswer | null {
  const exactId =
    scenario.answers.find(
      answer =>
        answer.questionId ===
        actionId,
    );

  if (
    exactId
  ) {
    return exactId;
  }

  const textMatch =
    scenario.answers.find(
      answer =>
        answer.questionContains !==
          undefined &&
        contains(
          actionText,
          answer.questionContains,
        ),
    );

  return (
    textMatch ??
    null
  );
}

function resolveOption(
  options:
    DiagnosticActionOption[],
  answer:
    DiagnosticScenarioAnswer,
): DiagnosticActionOption | null {
  if (
    answer.optionId
  ) {
    const exactId =
      options.find(
        option =>
          option.id ===
          answer.optionId,
      );

    if (
      exactId
    ) {
      return exactId;
    }
  }

  if (
    answer.optionLabelContains
  ) {
    const normalizedExpected =
      normalize(
        answer.optionLabelContains,
      );

    const exactLabel =
      options.find(
        option =>
          normalize(
            option.label,
          ) ===
          normalizedExpected,
      );

    if (
      exactLabel
    ) {
      return exactLabel;
    }

    const containsLabel =
      options.find(
        option =>
          contains(
            option.label,
            answer.optionLabelContains ??
              "",
          ),
      );

    if (
      containsLabel
    ) {
      return containsLabel;
    }
  }

  return null;
}

function getPrimaryHypothesis(
  result: ReturnType<
    DiagnosticEngineV2["createSession"]
  >,
) {
  return (
    result.reasoning
      .decision
      .probabilities[0] ??
    null
  );
}

function getRecommendedPart(
  result: ReturnType<
    DiagnosticEngineV2["createSession"]
  >,
  scenario:
    DiagnosticScenario,
): string | null {
  const knowledgeLoader =
    new KnowledgeLoader();

  const partEngine =
    new PartRecommendationEngineV2();

  const knowledge =
    knowledgeLoader.loadDomain(
      scenario.domain,
    );

  const recommendation =
    partEngine.recommend(
      knowledge,
      result.reasoning,
      scenario.profile,
    );

  return (
    recommendation
      .primaryPart
      ?.partName ??
    null
  );
}

function buildResult(
  scenario:
    DiagnosticScenario,
  steps:
    DiagnosticScenarioStep[],
  result:
    ReturnType<
      DiagnosticEngineV2["createSession"]
    >,
  failures:
    string[],
): DiagnosticScenarioResult {
  const primary =
    getPrimaryHypothesis(
      result,
    );

  return {
    scenarioId:
      scenario.id,

    passed:
      failures.length ===
      0,

    questionCount:
      steps.length,

    conclusionId:
      primary
        ?.hypothesis
        .id ??
      null,

    conclusionTitle:
      primary
        ?.hypothesis
        .name ??
      null,

    confidence:
      primary
        ?.probability ??
      0,

    recommendedPart:
      getRecommendedPart(
        result,
        scenario,
      ),

    steps,

    failures,
  };
}

function tryFallbackOption(
  options:
    DiagnosticActionOption[],
): DiagnosticActionOption | null {
  const preferredIds = [
    "unknown",
    "unsure",
    "not-tested",
    "not-done",
    "no",
  ];

  for (
    const id
    of preferredIds
  ) {
    const match =
      options.find(
        option =>
          option.id ===
          id,
      );

    if (
      match
    ) {
      return match;
    }
  }

  return null;
}

export class ScenarioExecutor {
  public execute(
    scenario:
      DiagnosticScenario,
  ): DiagnosticScenarioResult {
    const engine =
      new DiagnosticEngineV2();

    const sessionId =
      `scenario-${scenario.id}`;

    let result =
      engine.createSession(
        sessionId,
        scenario.profile,
        scenario.domain,
        scenario.initialEvidenceIds ??
          [],
      );

    const steps:
      DiagnosticScenarioStep[] =
      [];

    const failures:
      string[] =
      [];

    const consumedAnswers =
      new Set<number>();

    let safetyCounter =
      0;

    while (
      !result.completed &&
      result.action &&
      safetyCounter <
        50
    ) {
      safetyCounter +=
        1;

      const action =
        result.action;

      const options =
        action.options ??
        [];

      let matchedAnswer:
        DiagnosticScenarioAnswer | null =
        null;

      let matchedIndex =
        -1;

      for (
        let index = 0;
        index <
        scenario.answers.length;
        index += 1
      ) {
        if (
          consumedAnswers.has(
            index,
          )
        ) {
          continue;
        }

        const candidate =
          scenario.answers[
            index
          ];

        const match =
          findMatchingAnswer(
            {
              ...scenario,
              answers: [
                candidate,
              ],
            },
            action.id,
            action.text,
          );

        if (
          match
        ) {
          matchedAnswer =
            candidate;

          matchedIndex =
            index;

          break;
        }
      }

      let selectedOption:
        DiagnosticActionOption | null =
        null;

      if (
        matchedAnswer
      ) {
        selectedOption =
          resolveOption(
            options,
            matchedAnswer,
          );

        if (
          selectedOption &&
          matchedIndex >=
            0
        ) {
          consumedAnswers.add(
            matchedIndex,
          );
        }
      }

      if (
        !selectedOption
      ) {
        selectedOption =
          tryFallbackOption(
            options,
          );
      }

      if (
        !selectedOption
      ) {
        failures.push(
          [
            "Aucune rǸponse exploitable pour la question.",
            `Question : ${action.id}.`,
            `Texte : ${action.text}.`,
          ].join(
            " ",
          ),
        );

        break;
      }

      steps.push({
        index:
          steps.length +
          1,

        questionId:
          action.id,

        questionText:
          action.text,

        selectedOptionId:
          selectedOption.id,

        selectedOptionLabel:
          selectedOption.label,
      });

      result =
        engine.answer(
          result.session,
          scenario.domain,
          action.id,
          selectedOption.id,
        );
    }

    if (
      safetyCounter >=
      50
    ) {
      failures.push(
        "Limite de sǸcuritǸ atteinte : plus de 50 questions.",
      );
    }

    return buildResult(
      scenario,
      steps,
      result,
      failures,
    );
  }
}


