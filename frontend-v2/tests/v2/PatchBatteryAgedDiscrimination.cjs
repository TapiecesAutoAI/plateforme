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

if (!Array.isArray(rules)) {
  throw new Error(
    "rules.json doit être un tableau.",
  );
}

const id =
  "postcharge-low-contradict-discharged";

if (
  !rules.some(
    rule => rule.id === id,
  )
) {
  rules.push({
    id,
    evidenceId:
      "measurement-post-charge-below-12-2",
    hypothesisId:
      "problem-discharged-battery",
    effect:
      "contradict",
    weight:
      0.92,
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
  "AGED/DISCHARGED discrimination installed.",
);

console.log(
  "Rules:",
  rules.length,
);
