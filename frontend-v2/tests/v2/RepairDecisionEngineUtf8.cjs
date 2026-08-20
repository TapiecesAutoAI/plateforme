const fs =
  require("fs");

const file =
  "./engine/reasoning/DecisionEngine.ts";

let text =
  fs.readFileSync(
    file,
    "utf8",
  );

const concludePattern =
  /case "conclude":\s*return\s*\(\s*`Diagnostic retenu : \$\{hypothesis\.name\}\. ` \+\s*`[^`]*\$\{probability\} %, avance ` \+\s*`\$\{Math\.round\(snapshot\.lead \* 100\)\} points et couverture des preuves ` \+\s*`\$\{Math\.round\(snapshot\.evidenceCoverage \* 100\)\} %\.`\s*\);/m;

const concludeReplacement =
`case "conclude":

        return (
          \`Diagnostic retenu : \${hypothesis.name}. \` +
          \`Probabilité \${probability} %, avance \` +
          \`\${Math.round(snapshot.lead * 100)} points et couverture des preuves \` +
          \`\${Math.round(snapshot.evidenceCoverage * 100)} %.\`
        );`;

if (
  !concludePattern.test(
    text,
  )
) {
  throw new Error(
    "Bloc conclude introuvable.",
  );
}

text =
  text.replace(
    concludePattern,
    concludeReplacement,
  );

const askPattern =
  /case "ask_question":\s*return\s*\(\s*`[^`]*\$\{hypothesis\.name\}[^`]*` \+\s*`[^`]*\$\{probability\} %[^`]*` \+\s*`[^`]*`\s*\);/m;

const askReplacement =
`case "ask_question":

        return (
          \`L'hypothèse principale est "\${hypothesis.name}" \` +
          \`à \${probability} %, mais une information supplémentaire \` +
          \`est nécessaire avant de conclure.\`
        );`;

if (
  !askPattern.test(
    text,
  )
) {
  throw new Error(
    "Bloc ask_question introuvable.",
  );
}

text =
  text.replace(
    askPattern,
    askReplacement,
  );

fs.writeFileSync(
  file,
  text,
  "utf8",
);

console.log(
  "DecisionEngine UTF-8 repaired.",
);
