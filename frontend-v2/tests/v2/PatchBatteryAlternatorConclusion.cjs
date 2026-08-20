const fs = require("fs");

const file =
  "./knowledge/battery/actions.json";

const actions =
  JSON.parse(
    fs.readFileSync(
      file,
      "utf8",
    ),
  );

const action =
  actions.find(
    item =>
      item.id ===
      "battery-alternator-connection-check",
  );

if (!action) {
  throw new Error(
    "battery-alternator-connection-check introuvable.",
  );
}

const good =
  (action.options ?? []).find(
    option =>
      option.id === "good",
  );

if (!good) {
  throw new Error(
    "Option good introuvable.",
  );
}

console.log(
  "AVANT:",
  good.nextActionId,
);

good.nextActionId =
  "battery-conclude";

console.log(
  "APRES:",
  good.nextActionId,
);

fs.writeFileSync(
  file,
  JSON.stringify(
    actions,
    null,
    2,
  ) + "\n",
  "utf8",
);
