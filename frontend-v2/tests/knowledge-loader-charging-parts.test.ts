import {
  describe,
  expect,
  it,
} from "vitest";

import {
  KnowledgeLoader,
} from "../engine/knowledge";

describe(
  "KnowledgeLoader charging parts",
  () => {

    it(
      "must load charging part metadata at runtime",
      () => {

        const loader =
          new KnowledgeLoader();

        const knowledge =
          loader.loadDomain(
            "charging",
          );

        expect(
          knowledge.parts,
        ).toHaveLength(9);

        const alternator =
          knowledge.parts.find(
            part =>
              part.id ===
              "part-alternator",
          );

        const terminal =
          knowledge.parts.find(
            part =>
              part.id ===
              "part-battery-terminal",
          );

        expect(
          alternator,
        ).toBeDefined();

        expect(
          alternator
            ?.requiresVehicleIdentification,
        ).toBe(true);

        expect(
          terminal,
        ).toBeDefined();

        expect(
          terminal
            ?.requiresVehicleIdentification,
        ).toBe(false);
      },
    );
  },
);
