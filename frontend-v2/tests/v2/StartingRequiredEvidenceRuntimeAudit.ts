import {
  DiagnosticEngineV2,
} from "../../engine/core/DiagnosticEngineV2";

const engine = new DiagnosticEngineV2();

const result =
  engine.createSession(
    "starting-required-evidence-runtime",
    "mecanicien-garage" as any,
    "starting" as any,
    [],
  );

const reasoning =
  result.reasoning as any;

const questions =
  Array.from(
    reasoning.context.questions.values(),
  ) as any[];

const withRequirements =
  questions.filter(
    question =>
      (
        question.requiredEvidenceIds ??
        []
      ).length > 0,
  );

console.log("");
console.log(
  "=== STARTING RUNTIME REQUIRED EVIDENCE ===",
);

console.log(
  `Questions total       : ${questions.length}`,
);

console.log(
  `Avec requiredEvidence : ${withRequirements.length}`,
);

console.log("");

for (
  const question
  of withRequirements
) {

  console.log(
    "----------------------------------------",
  );

  console.log(
    `QUESTION : ${question.id}`,
  );

  console.log(
    `TEXT     : ${question.text}`,
  );

  console.log(
    `REQUIRES : ${
      (
        question.requiredEvidenceIds ??
        []
      ).join(", ")
    }`,
  );

  console.log(
    `TARGET E : ${
      (
        question.targetEvidenceIds ??
        []
      ).join(", ")
    }`,
  );

  console.log(
    `TARGET H : ${
      (
        question.targetHypothesisIds ??
        []
      ).join(", ")
    }`,
  );
}

console.log("");
console.log(
  "=== FIN ===",
);
