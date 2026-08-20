import fs from "node:fs";
import path from "node:path";

import {
  startingActions,
} from "../engine/workflows/starting/actions";

const outputPath =
  path.join(
    process.cwd(),
    "knowledge",
    "starting",
    "actions.json",
  );

fs.writeFileSync(
  outputPath,
  JSON.stringify(
    startingActions,
    null,
    2,
  ) + "\n",
  "utf8",
);

console.log(
  `OK : ${startingActions.length} actions exportées vers ${outputPath}`,
);
