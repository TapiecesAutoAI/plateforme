import fs from "node:fs";
import path from "node:path";

const FILES = [
  path.resolve("engine/knowledge-packs/transmission/actions.json"),
  path.resolve("knowledge/transmission/actions.json"),
];

const FAMILY_RULES: Record<string, string[]> = {
  manual: [
    "transmission-manual-",
    "transmission-clutch-",
    "transmission-particulier-clutch-",
    "transmission-particulier-shift-linkage",
    "transmission-particulier-differential",
  ],

  automatic: [
    "transmission-automatic-",
    "transmission-particulier-automatic",
  ],

  dct: [
    "transmission-dct-",
    "transmission-particulier-dct",
  ],

  cvt: [
    "transmission-cvt-",
    "transmission-particulier-cvt",
  ],
};

function detectFamily(id: string | null | undefined): string | null {
  if (!id) return null;

  for (const [family, prefixes] of Object.entries(FAMILY_RULES)) {
    if (prefixes.some(prefix => id.startsWith(prefix))) {
      return family;
    }
  }

  return null;
}

function inspectFile(file: string) {
  console.log("");
  console.log("============================================================");
  console.log(" TRANSMISSION - AUDIT ETANCHEITE FAMILLES");
  console.log("============================================================");
  console.log(file);
  console.log("");

  const raw = fs.readFileSync(file, "utf8");
  const data = JSON.parse(raw);

  const actions = Array.isArray(data)
    ? data
    : Array.isArray(data.actions)
      ? data.actions
      : [];

  console.log(`ACTIONS=${actions.length}`);

  let transitions = 0;
  let suspicious = 0;

  const problems: any[] = [];

  for (const action of actions) {
    const sourceId = action.id ?? "";
    const sourceFamily = detectFamily(sourceId);

    const inspectTarget = (
      targetId: string | null | undefined,
      origin: string,
      optionId?: string,
      profile?: string,
    ) => {
      if (!targetId) return;

      transitions++;

      const targetFamily = detectFamily(targetId);

      if (
        sourceFamily &&
        targetFamily &&
        sourceFamily !== targetFamily
      ) {
        suspicious++;

        problems.push({
          sourceId,
          sourceFamily,
          targetId,
          targetFamily,
          origin,
          optionId: optionId ?? null,
          profile: profile ?? null,
        });
      }
    };

    inspectTarget(
      action.nextActionId,
      "action.nextActionId",
    );

    for (const option of action.options ?? []) {
      inspectTarget(
        option.nextActionId,
        "option.nextActionId",
        option.id,
      );

      const profileRoutes =
        option.nextActionIdByProfile ?? {};

      for (const [profile, targetId] of Object.entries(profileRoutes)) {
        inspectTarget(
          targetId as string,
          "option.nextActionIdByProfile",
          option.id,
          profile,
        );
      }
    }
  }

  console.log(`TRANSITIONS=${transitions}`);
  console.log(`CROSS_FAMILY=${suspicious}`);

  console.log("");
  console.log("============================================================");
  console.log(" TRANSITIONS CROSS-FAMILY");
  console.log("============================================================");

  if (problems.length === 0) {
    console.log("AUCUNE");
  } else {
    for (const problem of problems) {
      console.log("");
      console.log(
        `${problem.sourceFamily.toUpperCase()} -> ${problem.targetFamily.toUpperCase()}`
      );
      console.log(`SOURCE=${problem.sourceId}`);
      console.log(`TARGET=${problem.targetId}`);
      console.log(`ORIGIN=${problem.origin}`);

      if (problem.optionId) {
        console.log(`OPTION=${problem.optionId}`);
      }

      if (problem.profile) {
        console.log(`PROFILE=${problem.profile}`);
      }
    }
  }

  console.log("");
  console.log("============================================================");
  console.log(" RECHERCHE SPECIALE CVT -> MANUAL");
  console.log("============================================================");

  const cvtManual = problems.filter(
    problem =>
      problem.sourceFamily === "cvt" &&
      problem.targetFamily === "manual",
  );

  if (cvtManual.length === 0) {
    console.log("AUCUNE TRANSITION DIRECTE CVT -> MANUAL");
  } else {
    for (const problem of cvtManual) {
      console.log(
        `${problem.sourceId} -> ${problem.targetId}`
      );
    }
  }

  console.log("");
}

for (const file of FILES) {
  if (!fs.existsSync(file)) {
    console.log(`ABSENT : ${file}`);
    continue;
  }

  inspectFile(file);
}

console.log("");
console.log("============================================================");
console.log(" IMPORTANT");
console.log("============================================================");
console.log("");
console.log(
  "Cet audit cherche les transitions JSON directes entre familles."
);
console.log(
  "Si CROSS_FAMILY=0 mais que l'audit dynamique produit encore"
);
console.log(
  "CVT -> clutch-hydraulic -> shift-linkage,"
);
console.log(
  "la contamination vient du fallback selectNonRedundantAction"
);
console.log(
  "et non du routage nextActionIdByProfile."
);
console.log("");
console.log("============================================================");
console.log(" FIN - AUCUNE MODIFICATION");
console.log("============================================================");
