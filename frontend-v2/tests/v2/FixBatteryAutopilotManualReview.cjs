const fs = require("fs");

const file =
  "./tests/v2/BatteryEngineAutopilot.ts";

let text =
  fs.readFileSync(
    file,
    "utf8",
  );

text =
  text.replace(
    "  let anomalies = 0;",
    `  let anomalies = 0;
  let manualReviews = 0;`,
  );

const marker =
`    if (!action) {
      anomalies++;`;

const replacement =
`    if (!action) {

      if (
        result.session.status ===
        "manual-review-required"
      ) {
        manualReviews++;
        continue;
      }

      anomalies++;`;

if (!text.includes(marker)) {
  throw new Error(
    "Bloc !action introuvable.",
  );
}

text =
  text.replace(
    marker,
    replacement,
  );

const outputMarker =
`  output.push(
    \`Anomalies : \${anomalies}\`,
  );`;

const outputReplacement =
`  output.push(
    \`Anomalies : \${anomalies}\`,
  );

  output.push(
    \`Manual reviews : \${manualReviews}\`,
  );`;

if (!text.includes(outputMarker)) {
  throw new Error(
    "Bloc sortie anomalies introuvable.",
  );
}

text =
  text.replace(
    outputMarker,
    outputReplacement,
  );

fs.writeFileSync(
  file,
  text,
  "utf8",
);

console.log(
  "Battery autopilot manual-review handling installed.",
);
