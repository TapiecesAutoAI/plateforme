import {
  describe,
  expect,
  it,
} from "vitest";

import fs from "node:fs";
import path from "node:path";

describe(
  "diagnostic-v2 frontend clarification UI",
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
      "sends only token and controlled choice",
      () => {

        expect(
          page,
        ).toContain(
          '"resolve-clarification"',
        );

        expect(
          page,
        ).toContain(
          "clarificationToken:",
        );

        const functionStart =
          page.indexOf(
            "async function resolveClarification",
          );

        const functionEnd =
          page.indexOf(
            "async function answerQuestion",
          );

        const resolutionFunction =
          page.slice(
            functionStart,
            functionEnd,
          );

        expect(
          resolutionFunction,
        ).not.toContain(
          "evidenceId:",
        );

        expect(
          resolutionFunction,
        ).not.toContain(
          "evidenceIds:",
        );
      },
    );

    it(
      "offers controlled confirmation choices",
      () => {

        expect(
          page,
        ).toContain(
          '"confirm"',
        );

        expect(
          page,
        ).toContain(
          '"reject"',
        );

        expect(
          page,
        ).toContain(
          '"unsure"',
        );
      },
    );

    it(
      "offers controlled conflict choices",
      () => {

        expect(
          page,
        ).toContain(
          '"first"',
        );

        expect(
          page,
        ).toContain(
          '"second"',
        );
      },
    );

    it(
      "shows clarification prompt before engine action",
      () => {

        expect(
          page,
        ).toContain(
          "clarificationItem.prompt",
        );

        expect(
          page,
        ).toMatch(
          /nextClarification[\s\S]*?clarificationItem\.prompt[\s\S]*?else if[\s\S]*?data\.action/,
        );
      },
    );

  },
);