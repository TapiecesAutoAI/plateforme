import fs from "node:fs";
import path from "node:path";

const domain =
(process.argv[2] ?? "").trim();

if (!domain) {
    console.log("");
    console.log("Utilisation :");
    console.log("npx tsx tools/KnowledgeBuilder.ts charging");
    process.exit(1);
}

const root =
path.join(
    process.cwd(),
    "engine",
    "knowledge",
    domain,
);

fs.mkdirSync(
    root,
    {
        recursive: true,
    },
);

const files = {

"actions.ts":`export const actions = [];
`,

"evidences.ts":`export const evidences = [];
`,

"hypotheses.ts":`export const hypotheses = [];
`,

"rules.ts":`export const rules = [];
`,

"workflow.ts":`export const workflow = [];
`,

"parts.ts":`export const parts = [];
`,

"index.ts":`export * from "./actions";
export * from "./evidences";
export * from "./hypotheses";
export * from "./rules";
export * from "./workflow";
export * from "./parts";
`
};

for(const file in files){

    const filename =
    path.join(
        root,
        file,
    );

    if(
        !fs.existsSync(
            filename,
        )
    ){

        fs.writeFileSync(
            filename,
            files[file as keyof typeof files],
            "utf8",
        );

        console.log(
            "Créé :",
            file,
        );

    }else{

        console.log(
            "Existe :",
            file,
        );

    }

}

console.log("");
console.log("=================================");
console.log("Domaine créé :",domain);
console.log("=================================");
