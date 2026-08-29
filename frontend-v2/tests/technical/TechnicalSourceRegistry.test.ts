import {
  describe,
  expect,
  it,
} from "vitest";

import {
  detectTechnicalSourceBrand,
} from "../../components/technical/TechnicalSourceRegistry";

describe(
  "TechnicalSourceRegistry",
  () => {

    it(
      "detects Castrol",
      () => {

        expect(
          detectTechnicalSourceBrand(
            "Castrol Product Finder - manual experimental verification",
          ),
        ).toBe(
          "castrol",
        );
      },
    );

    it(
      "detects Motul",
      () => {

        expect(
          detectTechnicalSourceBrand(
            "Motul Oil Selector - manual experimental verification",
          ),
        ).toBe(
          "motul",
        );
      },
    );

    it(
      "keeps unknown source safe",
      () => {

        expect(
          detectTechnicalSourceBrand(
            "Random technical source",
          ),
        ).toBe(
          "unknown",
        );
      },
    );

  },
);