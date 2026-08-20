const fs = require("fs");

const file =
  "./engine/core/DiagnosticEngineV2.ts";

let lines =
  fs.readFileSync(
    file,
    "utf8",
  ).split(/\r?\n/);

// ============================================================
// 1. INSERER hasForcedBranchAction AVANT confirmationV2Result
// ============================================================

let confirmationIndex =
  lines.findIndex(
    line =>
      line.trim() ===
      "const confirmationV2Result =",
  );

if (
  confirmationIndex < 0
) {
  throw new Error(
    "const confirmationV2Result introuvable.",
  );
}

const alreadyInstalled =
  lines.some(
    line =>
      line.includes(
        "const hasForcedBranchAction =",
      ),
  );

if (!alreadyInstalled) {

  const block = [
    "    const hasForcedBranchAction =",
    "      session.currentActionId !== null &&",
    "      selectedAction !== null &&",
    "      selectedAction.id ===",
    "        session.currentActionId;",
    "",
  ];

  lines.splice(
    confirmationIndex,
    0,
    ...block,
  );

  confirmationIndex +=
    block.length;
}

// ============================================================
// 2. PROTEGER CONFIRMATION V2
// ============================================================

let v2Index =
  lines.findIndex(
    (line, index) =>
      line.trim() ===
        "confirmationV2Result.shouldConfirm &&" &&
      index > confirmationIndex,
  );

if (v2Index < 0) {
  throw new Error(
    "Condition Confirmation V2 introuvable.",
  );
}

if (
  lines[v2Index - 1]
    ?.trim() !==
    "!hasForcedBranchAction &&"
) {
  lines.splice(
    v2Index,
    0,
    "      !hasForcedBranchAction &&",
  );
}

// ============================================================
// 3. PROTEGER CONFIRMATION ORCHESTRATOR
// ============================================================

let orchestratorIndex =
  lines.findIndex(
    line =>
      line.trim() ===
      "!confirmationV2Applied &&",
  );

if (
  orchestratorIndex < 0
) {
  throw new Error(
    "Condition orchestrateur introuvable.",
  );
}

if (
  lines[orchestratorIndex - 1]
    ?.trim() !==
    "!hasForcedBranchAction &&"
) {
  lines.splice(
    orchestratorIndex,
    0,
    "      !hasForcedBranchAction &&",
  );
}

// ============================================================
// 4. ECRITURE
// ============================================================

fs.writeFileSync(
  file,
  lines.join("\n"),
  "utf8",
);

console.log(
  "Forced workflow branch protection installed.",
);
