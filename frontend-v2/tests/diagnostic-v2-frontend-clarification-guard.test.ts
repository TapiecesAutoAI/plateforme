import {
  describe,
  expect,
  it,
} from "vitest";

import fs from "node:fs";
import path from "node:path";

describe(
  "diagnostic-v2 frontend clarification guard",
  () => {

    const page =
      fs.readFileSync(
        path.join(
          process.cwd(),
          "app/diagnostic-v2/page.tsx",
        ),
        "utf8",
      );

    it(
      "stores server clarification state",
      () => {

        expect(
          page,
        ).toContain(
          "useState<ComplaintClarificationState | null>",
        );

        expect(
          page,
        ).toContain(
          "setClarification(",
        );
      },
    );

    it(
      "does not expose engine action while clarification is active",
      () => {

        expect(
          page,
        ).toMatch(
          /setAction\(\s*nextClarification\s*\?\s*null\s*:\s*data\.action/,
        );

        expect(
          page,
        ).toMatch(
          /if\s*\(\s*nextClarification\s*\)[\s\S]*?else if\s*\(\s*data\.action\s*\)/,
        );
      },
    );

    it(
      "guards technical action and result rendering",
      () => {

        const guards =
          page.match(
            /!clarification\s*&&/g,
          ) ?? [];

        expect(
          guards.length,
        ).toBeGreaterThanOrEqual(2);
      },
    );

  },
);