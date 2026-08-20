const fs = require("fs");

const file =
  "./engine/core/DiagnosticEngineV2.ts";

let text =
  fs.readFileSync(
    file,
    "utf8",
  );

const oldBlock =
`    if (
      selectedAction?.type ===
        "complete-diagnosis"
    ) {
      this.completeSession(
        session,
        knowledge,
        reasoning,
      );

      return {
        session,
        action:
          null,
        completed:
          true,
        reasoning,
        stopSuggestion,
        completionAdvice,
      };
    }`;

const newBlock =
`    if (
      selectedAction?.type ===
        "complete-diagnosis"
    ) {
      this.completeSession(
        session,
        knowledge,
        reasoning,
      );

      return {
        session,
        action:
          null,
        completed:
          session.status === "completed",
        reasoning,
        stopSuggestion,
        completionAdvice,
      };
    }`;

if (!text.includes(oldBlock)) {
  throw new Error(
    "Bloc complete-diagnosis introuvable.",
  );
}

text =
  text.replace(
    oldBlock,
    newBlock,
  );

fs.writeFileSync(
  file,
  text,
  "utf8",
);

console.log(
  "Complete-diagnosis status fix installed.",
);
