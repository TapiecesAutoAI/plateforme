const fs = require("fs");

const file =
  "./knowledge/charging/actions.json";

const actions =
  JSON.parse(
    fs.readFileSync(
      file,
      "utf8",
    ),
  );

if (!Array.isArray(actions)) {
  throw new Error(
    "actions.json doit contenir un tableau.",
  );
}

const action =
  actions.find(
    item =>
      item.id ===
      "charging-battery-sensor-check",
  );

if (!action) {
  throw new Error(
    "charging-battery-sensor-check introuvable.",
  );
}

const bad =
  (action.options ?? []).find(
    option =>
      option.id === "bad",
  );

const good =
  (action.options ?? []).find(
    option =>
      option.id === "good",
  );

if (!bad || !good) {
  throw new Error(
    "Options bad/good introuvables.",
  );
}

bad.supportsHypotheses = [
  "problem-battery-sensor",
];

bad.rejectsHypotheses = [
  "problem-alternator-failure",
];

good.rejectsHypotheses = [
  "problem-battery-sensor",
];

fs.writeFileSync(
  file,
  JSON.stringify(
    actions,
    null,
    2,
  ) + "\n",
  "utf8",
);

console.log(
  "Battery sensor option patch installed.",
);
console.log(
  "Actions:",
  actions.length,
);
