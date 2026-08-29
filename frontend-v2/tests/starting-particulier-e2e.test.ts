import {
  describe,
  expect,
  it,
} from "vitest";

import {
  appendFileSync,
  writeFileSync,
} from "node:fs";

import {
  buildConversationEngine,
} from "../lib/ai/chatEngine";

type EngineMessages =
  Parameters<
    typeof buildConversationEngine
  >[0];

type EngineMessage =
  EngineMessages[number];

type EngineState =
  ReturnType<
    typeof buildConversationEngine
  >;

function userMessage(
  content: string,
): EngineMessage {
  return {
    role: "user",
    content,
  } as EngineMessage;
}

function assistantMessage(
  content: string,
): EngineMessage {
  return {
    role: "assistant",
    content,
  } as EngineMessage;
}

function findOption(
  state: EngineState,
  pattern: RegExp,
) {
  const question =
    state.nextQuestion;

  if (!question) {
    throw new Error(
      "Aucune question disponible.",
    );
  }

  const option =
    question.options.find(
      (candidate) =>
        pattern.test(
          candidate.label,
        ) ||
        pattern.test(
          candidate.value,
        ),
    );

  if (!option) {
    throw new Error(
      [
        `Option introuvable pour : ${question.text}`,
        "Options :",
        ...question.options.map(
          (candidate) =>
            `- ${candidate.id} | ${candidate.label}`,
        ),
      ].join("\n"),
    );
  }

  return option;
}

function selectNeutralOption(
  state: EngineState,
) {
  const neutralPatterns = [
    /^Je ne sais pas$/i,
    /Test non effectué/i,
    /Pas encore test/i,
    /Impossible à tester/i,
    /Je ne peux pas/i,
  ];

  for (
    const pattern
    of neutralPatterns
  ) {
    const question =
      state.nextQuestion;

    if (!question) {
      break;
    }

    const option =
      question.options.find(
        (candidate) =>
          pattern.test(
            candidate.label,
          ) ||
          pattern.test(
            candidate.value,
          ),
      );

    if (option) {
      return option;
    }
  }

  const question =
    state.nextQuestion;

  throw new Error(
    [
      `Aucune réponse neutre pour : ${question?.text ?? "question inconnue"}`,
      "Options :",
      ...(
        question?.options.map(
          (candidate) =>
            `- ${candidate.id} | ${candidate.label}`,
        ) ?? []
      ),
    ].join("\n"),
  );
}

function runParticulierScenario(
  lightsAnswer:
    | "dim"
    | "normal",
): EngineState {

  const messages:
    EngineMessages = [
      userMessage(
        "particulier",
      ),
      userMessage(
        "ma voiture ne démarre pas",
      ),
    ];

  let state =
    buildConversationEngine(
      messages,
    );

  for (
    let step = 0;
    step < 10;
    step += 1
  ) {
    if (
      state.diagnosisComplete
    ) {
      return state;
    }

    const question =
      state.nextQuestion;

    if (!question) {
      return state;
    }

    let option;

    if (
      /Que se passe-t-il lorsque vous essayez de démarrer/i.test(
        question.text,
      )
    ) {
      option =
        findOption(
          state,
          /Le moteur ne tourne pas/i,
        );
    }
    else if (
      /antivol|cadenas|voyant de clé/i.test(
        question.text,
      )
    ) {
      option =
        findOption(
          state,
          /^Non$/i,
        );
    }
    else if (
      /phares faiblissent-ils pendant la tentative de démarrage/i.test(
        question.text,
      )
    ) {
      option =
        lightsAnswer ===
        "dim"
          ? findOption(
              state,
              /Oui,\s*fortement/i,
            )
          : findOption(
              state,
              /Non,\s*ils restent normaux/i,
            );
    }
    else {
      option =
        selectNeutralOption(
          state,
        );
    }

    appendFileSync(
      "e2e-starting-trace.txt",
      JSON.stringify(
        {
          type: "STEP",
          step: step + 1,
          questionId: question.id,
          question: question.text,
          optionId: option.id,
          optionLabel: option.label,
          optionValue: option.value,
        },
        null,
        2,
      ) + "\n",
      "utf8",
    );

    messages.push(
      assistantMessage(
        question.text,
      ),
    );

    messages.push(
      userMessage(
        option.value,
      ),
    );

    state =
      buildConversationEngine(
        messages,
      );

    appendFileSync(
      "e2e-starting-trace.txt",
      JSON.stringify(
        {
          type: "STATE",
          askedQuestions:
            state.askedQuestions,
          primaryHypothesisId:
            state.decision.primaryHypothesisId,
          confidence:
            state.decision.confidence,
          complete:
            state.diagnosisComplete,
        },
        null,
        2,
      ) + "\n",
      "utf8",
    );
  }

  return state;
}

writeFileSync(
  "e2e-starting-trace.txt",
  "",
  "utf8",
);

describe(
  "Starting E2E - Particulier",
  () => {

    it(
      "phares fortement faibles -> famille batterie / masse",
      () => {

        const state =
          runParticulierScenario(
            "dim",
          );

        expect(
          state.diagnosisComplete,
        ).toBe(true);

        expect(
          state.askedQuestions.length,
        ).toBeLessThanOrEqual(5);

        expect(
          state.decision
            .primaryHypothesisId,
        ).toMatch(
          /battery|ground/i,
        );

        expect(
          state.diagnostic
            ?.title,
        ).toMatch(
          /batterie|masse/i,
        );
      },
    );

    it(
      "phares normaux -> famille démarreur / commande",
      () => {

        const state =
          runParticulierScenario(
            "normal",
          );

        expect(
          state.diagnosisComplete,
        ).toBe(true);

        expect(
          state.askedQuestions.length,
        ).toBeLessThanOrEqual(5);

        expect(
          state.decision
            .primaryHypothesisId,
        ).toMatch(
          /starter/i,
        );

        expect(
          state.diagnostic
            ?.title,
        ).toMatch(
          /démarreur|solénoïde|relais|commande/i,
        );
      },
    );

    it(
      "les deux réponses aux phares produisent deux hypothèses différentes",
      () => {

        const dim =
          runParticulierScenario(
            "dim",
          );

        const normal =
          runParticulierScenario(
            "normal",
          );

        expect(
          dim.decision
            .primaryHypothesisId,
        ).not.toBe(
          normal.decision
            .primaryHypothesisId,
        );
      },
    );
  },
);