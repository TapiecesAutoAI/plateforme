const fs = require("fs");

const file =
  "./knowledge/battery/rules.json";

const rules =
  JSON.parse(
    fs.readFileSync(
      file,
      "utf8",
    ),
  );

const id =
  "restart-fails-support-aged";

if (
  !rules.some(
    rule => rule.id === id,
  )
) {
  rules.push({
    id,
    evidenceId:
      "observation-restart-after-jump-fails",
    hypothesisId:
      "problem-aged-battery",
    effect:
      "support",
    weight:
      0.35,
  });
}

fs.writeFileSync(
  file,
  JSON.stringify(
    rules,
    null,
    2,
  ) + "\n",
  "utf8",
);

console.log(
  "Aged battery restart discrimination installed.",
);

console.log(
  "Rules:",
  rules.length,
);
