import {
  chargingEvidences,
  chargingHypotheses,
  chargingParts,
  chargingRules,
} from "../../engine/knowledge/charging";

import fs from "node:fs";

function readJson(path: string): any[] {
  return JSON.parse(
    fs.readFileSync(
      path,
      "utf8",
    ),
  );
}

const jsonEvidences =
  readJson("./knowledge/charging/evidences.json");

const jsonHypotheses =
  readJson("./knowledge/charging/hypotheses.json");

const jsonRules =
  readJson("./knowledge/charging/rules.json");

const jsonParts =
  readJson("./knowledge/charging/parts.json");

function compare(
  label: string,
  tsItems: { id: string }[],
  jsonItems: { id: string }[],
) {
  const tsIds =
    new Set(
      tsItems.map(
        item => item.id,
      ),
    );

  const jsonIds =
    new Set(
      jsonItems.map(
        item => item.id,
      ),
    );

  const onlyTs =
    [...tsIds].filter(
      id => !jsonIds.has(id),
    );

  const onlyJson =
    [...jsonIds].filter(
      id => !tsIds.has(id),
    );

  console.log("");
  console.log(`=== ${label} ===`);
  console.log(`TS   : ${tsItems.length}`);
  console.log(`JSON : ${jsonItems.length}`);
  console.log(`Seulement TS   : ${onlyTs.length}`);
  console.log(`Seulement JSON : ${onlyJson.length}`);

  if (onlyTs.length > 0) {
    console.log(
      "ONLY_TS:",
      onlyTs,
    );
  }

  if (onlyJson.length > 0) {
    console.log(
      "ONLY_JSON:",
      onlyJson,
    );
  }
}

compare(
  "EVIDENCES",
  chargingEvidences,
  jsonEvidences,
);

compare(
  "HYPOTHESES",
  chargingHypotheses,
  jsonHypotheses,
);

compare(
  "RULES",
  chargingRules,
  jsonRules,
);

compare(
  "PARTS",
  chargingParts,
  jsonParts,
);