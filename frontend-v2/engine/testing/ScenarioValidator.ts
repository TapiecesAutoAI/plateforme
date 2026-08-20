import type {
  DiagnosticScenario,
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

function containsForbiddenTerm(
  step: DiagnosticScenarioStep,
  forbiddenTerms: string[],
): string | null {
  const searchableText =
    normalize(
      [
        step.questionId,
        step.questionText,
      ].join(" "),
    );

  for (
    const term
    of forbiddenTerms
  ) {
    const normalizedTerm =
      normalize(term);

    if (
      normalizedTerm.length >
        0 &&
      searchableText.includes(
        normalizedTerm,
      )
    ) {
      return term;
    }
  }

  return null;
}

function validateMaximumQuestions(
  scenario: DiagnosticScenario,
  result: DiagnosticScenarioResult,
): string[] {
  const failures: string[] =
    [];

  if (
    result.questionCount >
    scenario.expectation
      .maximumQuestions
  ) {
    failures.push(
      [
        "Nombre maximal de questions dépassé.",
        `Maximum attendu : ${scenario.expectation.maximumQuestions}.`,
        `Obtenu : ${result.questionCount}.`,
      ].join(" "),
    );
  }

  return failures;
}

function validateConclusion(
  scenario: DiagnosticScenario,
  result: DiagnosticScenarioResult,
): string[] {
  const failures: string[] =
    [];

  const expectedIds =
    scenario.expectation
      .expectedHypothesisIds;

  if (
    expectedIds.length ===
    0
  ) {
    return failures;
  }

  if (
    result.conclusionId ===
    null
  ) {
    failures.push(
      [
        "Aucune hypothèse finale.",
        `Hypothèses acceptées : ${expectedIds.join(", ")}.`,
      ].join(" "),
    );

    return failures;
  }

  if (
    !expectedIds.includes(
      result.conclusionId,
    )
  ) {
    failures.push(
      [
        "Hypothèse finale incorrecte.",
        `Attendu : ${expectedIds.join(" | ")}.`,
        `Obtenu : ${result.conclusionId}.`,
      ].join(" "),
    );
  }

  return failures;
}

function validateConfidence(
  scenario: DiagnosticScenario,
  result: DiagnosticScenarioResult,
): string[] {
  const failures: string[] =
    [];

  const {
    minimumConfidence,
    maximumConfidence,
  } =
    scenario.expectation;

  if (
    !Number.isFinite(
      result.confidence,
    )
  ) {
    failures.push(
      "La confiance obtenue n'est pas un nombre valide.",
    );

    return failures;
  }

  if (
    result.confidence <
    minimumConfidence
  ) {
    failures.push(
      [
        "Confiance insuffisante.",
        `Minimum : ${(minimumConfidence * 100).toFixed(1)} %.`,
        `Obtenu : ${(result.confidence * 100).toFixed(1)} %.`,
      ].join(" "),
    );
  }

  if (
    result.confidence >
    maximumConfidence
  ) {
    failures.push(
      [
        "Confiance supérieure au maximum autorisé.",
        `Maximum : ${(maximumConfidence * 100).toFixed(1)} %.`,
        `Obtenu : ${(result.confidence * 100).toFixed(1)} %.`,
      ].join(" "),
    );
  }

  return failures;
}

function validateRecommendedPart(
  scenario: DiagnosticScenario,
  result: DiagnosticScenarioResult,
): string[] {
  const failures: string[] =
    [];

  const expectedParts =
    scenario.expectation
      .expectedPartNames;

  if (
    expectedParts.length ===
    0
  ) {
    return failures;
  }

  if (
    result.recommendedPart ===
    null
  ) {
    failures.push(
      [
        "Aucune pièce recommandée.",
        `Pièces acceptées : ${expectedParts.join(", ")}.`,
      ].join(" "),
    );

    return failures;
  }

  const normalizedActual =
    normalize(
      result.recommendedPart,
    );

  const matches =
    expectedParts.some(
      expectedPart =>
        normalize(
          expectedPart,
        ) ===
        normalizedActual,
    );

  if (
    !matches
  ) {
    failures.push(
      [
        "Pièce recommandée incorrecte.",
        `Attendu : ${expectedParts.join(" | ")}.`,
        `Obtenu : ${result.recommendedPart}.`,
      ].join(" "),
    );
  }

  return failures;
}

function validateForbiddenQuestions(
  scenario: DiagnosticScenario,
  result: DiagnosticScenarioResult,
): string[] {
  const failures: string[] =
    [];

  const forbiddenIds =
    new Set(
      scenario.expectation
        .forbiddenQuestionIds,
    );

  for (
    const step
    of result.steps
  ) {
    if (
      forbiddenIds.has(
        step.questionId,
      )
    ) {
      failures.push(
        `Question interdite posée : ${step.questionId}.`,
      );
    }
  }

  return failures;
}

function validateForbiddenTerms(
  scenario: DiagnosticScenario,
  result: DiagnosticScenarioResult,
): string[] {
  const failures: string[] =
    [];

  const forbiddenTerms =
    scenario.expectation
      .forbiddenQuestionTerms;

  if (
    forbiddenTerms.length ===
    0
  ) {
    return failures;
  }

  for (
    const step
    of result.steps
  ) {
    const forbiddenTerm =
      containsForbiddenTerm(
        step,
        forbiddenTerms,
      );

    if (
      forbiddenTerm !==
      null
    ) {
      failures.push(
        [
          `Terme interdit détecté : "${forbiddenTerm}".`,
          `Question : ${step.questionId}.`,
        ].join(" "),
      );
    }
  }

  return failures;
}

function removeDuplicates(
  failures: string[],
): string[] {
  return [
    ...new Set(
      failures,
    ),
  ];
}

export class ScenarioValidator {
  validate(
    scenario: DiagnosticScenario,
    result: DiagnosticScenarioResult,
  ): DiagnosticScenarioResult {
    const failures =
      removeDuplicates([
        ...result.failures,
        ...validateMaximumQuestions(
          scenario,
          result,
        ),
        ...validateConclusion(
          scenario,
          result,
        ),
        ...validateConfidence(
          scenario,
          result,
        ),
        ...validateRecommendedPart(
          scenario,
          result,
        ),
        ...validateForbiddenQuestions(
          scenario,
          result,
        ),
        ...validateForbiddenTerms(
          scenario,
          result,
        ),
      ]);

    return {
      ...result,
      passed:
        failures.length ===
        0,
      failures,
    };
  }
}
